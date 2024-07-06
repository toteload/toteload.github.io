// Overview
//
// @ast
// @types
// @parse

// @ast
// ----

class AstNode {}

class Lambda extends AstNode {
    constructor(params, body) {
        super();
        this.params = params;
        this.body = body;
    }

    toString() {
        return `lambda ${this.params.join(' ')}${this.params.length === 0 ? '' : ' '}-> ${this.body}`;
    }
}

class IfElse extends AstNode {
    constructor(cond, then, otherwise) {
        super();
        this.cond = cond;
        this.then = then;
        this.otherwise = otherwise;
    }

    toString() {
        return `if ${this.cond} then ${this.then} else ${this.otherwise}`;
    }
}

class Apply extends AstNode {
    constructor(func, args) {
        super();
        this.func = func;
        this.args = args;
    }

    toString() {
        return `(${this.func} ${this.args.join(' ')})`;
    }
}

// @types
// ------

class TypeIdGenerator {
    constructor() {
        this.counter = 0;
    }

    get_new_type_id() {
        const n = this.counter;
        this.counter += 1;
        return n;
    }

    reset() {
        this.counter = 0;
    }
}

const type_generator = new TypeIdGenerator();

class Type {}

class BoolType extends Type { 
    toString() { return "Bool"; }
}

class IntType extends Type { 
    toString() { return "Int"; }
}

class GenericType extends Type {
    constructor(name) {
        super();
        this.id = type_generator.get_new_type_id();
        this.name = name ?? `t${this.id}`;
    }

    toString() { return this.name; }
}

class FuncType extends Type {
    constructor(param_types, return_type) {
        super();
        this.param_types = param_types;
        this.return_type = return_type;
    }

    toString() {
        let params;
        if (this.param_types.length === 0) {
            params = '()';
        } else {
            params = `${this.param_types.join(' : ')}`;
        }
        return `(${params} -> ${this.return_type})`;
    }
}

// @parse
// ------

function parse_expression(source) {
    const s = source.trimStart();

    const numberRegex = /^(\+|-)?\d+/;

    if (s[0] === '(') {
        return parse_apply(s);
    } else if (/^lambda\s/.test(s)) {
        return parse_lambda(s);
    } else if (/^if\s/.test(s)) {
        return parse_if_else(s);
    } else if (/^true(\s|\)|$)/.test(s)) {
        return [new Boolean(true), s.slice('true'.length)];
    } else if (/^false(\s|\)|$)/.test(s)) {
        return [new Boolean(false), s.slice('false'.length)];
    } else if (numberRegex.test(s)) {
        const [num] = s.match(numberRegex);
        return [new Number(parseInt(num)), s.slice(num.length)];
    } else {
        return parse_identifier(s);        
    }
}

function parse_identifier(source) {
    const s = source.trimStart();

    const match = s.match(/^[a-zA-Z_\-\+><=*/][\w_\-\+><=*/]*/);
    if (match === null) {
        throw new Error('bad input:' + s);
    }

    const [ident] = match;
    return [new String(ident), s.slice(ident.length)];
}

function expect(source, expected, needs_space_after = true) {
    const s = source.trimStart();

    if (!s.startsWith(expected) || 
        (needs_space_after && !/^\s/.test(s.slice(expected.length)))) {
        throw new Error('oh no', source, expected);
    }

    return s.slice(expected.length);
}

function parse_lambda(source) {
    let s = expect(source, 'lambda');

    const params = [];

    while (true) {
        try {
            s = expect(s, '->');
            break;
        } catch (e) {}

        let param;
        [param, s] = parse_identifier(s);
        params.push(param);
    }

    let body;
    [body, s] = parse_expression(s);

    return [new Lambda(params, body), s];
}

function parse_apply(source) {
    let s = expect(source, '(', false);
    let func;
    [func, s] = parse_identifier(s);

    const args = [];
    while (true) {
        try {
            s = expect(s, ')', false);
            break;
        } catch (e) {}

        let arg;
        [arg, s] = parse_expression(s);
        args.push(arg);
    }

    return [new Apply(func, args), s];
}

function parse_if_else(source) {
    let s = expect(source, 'if');
    let cond, then, otherwise;

    [cond, s] = parse_expression(s);
    s = expect(s, 'then');
    [then, s] = parse_expression(s);
    s = expect(s, 'else');
    [otherwise, s] = parse_expression(s);

    return [new IfElse(cond, then, otherwise), s];
}

function parse(source) {
    const [ast, rest] = parse_expression(source);

    if (rest.trim().length !== 0) {
        throw new Error('Expected end of source but found more:' + rest.trim());
    }

    return ast;
}

// ---

function assign_types(expr, symbol_table) {
    // For all nodes in the expression we attach a type. This will be a generic type in most cases.
    // At this point, only numbers and boolean values will be recognized and given a concrete type.

    if (expr instanceof Number) {
        expr.type = new IntType();
    } else if (expr instanceof Boolean) {
        expr.type = new BoolType();
    } else if (expr instanceof String) {
        const sym = expr.toString();

        const symbol_is_defined = Object.hasOwn(symbol_table, sym);
        if (!symbol_is_defined) {
            throw new Error(`Undefined symbol used: ${sym}`);
        }

        expr.type = symbol_table[sym];
    } else if (expr instanceof AstNode){
        expr.type = new GenericType();

        if (expr instanceof Lambda) {
            const local_symbols = {};

            for (const param of expr.params) {
                const t = new GenericType();
                param.type = t;
                local_symbols[param] = t
            }

            assign_types(expr.body, {...symbol_table, ...local_symbols});
        } else if (expr instanceof IfElse) {
            assign_types(expr.cond, symbol_table);
            assign_types(expr.then, symbol_table);
            assign_types(expr.otherwise, symbol_table);
        } else if (expr instanceof Apply) {
            assign_types(expr.func, symbol_table);

            for (const arg of expr.args) {
                assign_types(arg, symbol_table);
            }
        } else {
            throw new Error('Unknown kind of AstNode object');
        }
    } else {
        throw new Error('Unknown object in ast');
    }
}

function generate_type_equations(expr) {
    // From the kind of ast node and the previously assigned types, we can generate equations.
    // For example, for an `IfElse` the condition type should be Bool. So the type that we
    // previously assigned to the condition node should be Bool too. Also, both branches of the
    // should return the same type, which is also the type of the whole `IfElse` expression.

    if (expr instanceof IfElse) {
        const equations = [
            [expr.cond.type, new BoolType()],
            [expr.type, expr.then.type],
            [expr.type, expr.otherwise.type],
        ];

        return equations
            .concat(generate_type_equations(expr.cond))
            .concat(generate_type_equations(expr.then))
            .concat(generate_type_equations(expr.otherwise));
    } else if (expr instanceof Lambda) {
        const equations = [
            [expr.type, new FuncType(expr.params.map((param) => param.type), expr.body.type)],
        ];

        return equations.concat(generate_type_equations(expr.body));
    } else if (expr instanceof Apply) {
        const equations = [
            [expr.func.type, new FuncType(expr.args.map((arg) => arg.type), expr.type)],
        ];

        return equations
            .concat(generate_type_equations(expr.func))
            .concat(...expr.args.map((arg) => generate_type_equations(arg)));
    } else if (expr instanceof Number || expr instanceof Boolean || expr instanceof String) {
        return [];
    } else {
        throw new Error('Unknown object in ast');
    }
}

// @unification
// ------------

function areTypesEqual(a, b) {
    if (!(a instanceof Type) || !(b instanceof Type)) {
        throw new Error('Unknown type');
    }

    if (a.constructor.name !== b.constructor.name) {
        return false;
    }

    if (a instanceof GenericType) {
        return a.name === b.name;
    }

    if (a instanceof FuncType) {
        return a.return_type === b.return_type && a.param_types.every((x, i) => x === b.param_types[i]);
    }

    return true;
}

function unify_equations(equations) {
    let substitutions = new Map();

    for (const [left, right] of equations) {
        unify(left, right, substitutions);
    }

    return substitutions;
}

function unify(left, right, subst) {
    if (areTypesEqual(left, right)) {
        return;
    } else if (left instanceof GenericType) {
        unify_generic_type(left, right, subst);
    } else if (right instanceof GenericType) {
        unify_generic_type(right, left, subst);
    } else if (left instanceof FuncType && right instanceof FuncType) {
        if (left.param_types.length !== right.param_types.length) {
            throw new Error('Cannot unify');
        }

        unify(left.return_type, right.return_type, subst);

        for (let i = 0; i < left.param_types.length; i++) {
            unify(left.param_types[i], right.param_types[i], subst);
        }
    }
}

function unify_generic_type(left, right, subst) {
    console.assert(left instanceof GenericType);

    if (subst.has(left.name)) {
        unify(subst.get(left.name), right, subst);
    } else if (right instanceof GenericType && subst.has(right.name)) {
        unify(left, subst.get(right.name), subst);
    } else if (generic_type_present_in_other(left, right, subst)) {
        throw new Error('Cannot unify');
    } else {
        subst.set(left.name, right);
    }
}

function generic_type_present_in_other(x, y, subst) {
    console.assert(x instanceof GenericType);

    if (areTypesEqual(x, y)) {
        return true;
    } else if (y instanceof GenericType && subst.has(y.name)) {
        return generic_type_present_in_other(x, subst.get(y.name), subst);
    } else if (y instanceof FuncType) {
        return generic_type_present_in_other(x, y.return_type, subst) || 
            y.param_types.some((param) => generic_type_present_in_other(x, param, subst));
    }

    return false;
}

function simplify(x, subst) {
    if (subst.size === 0 || (x instanceof BoolType) || (x instanceof IntType)) {
        return x;
    } else if (x instanceof GenericType) {
        if (subst.has(x.name)) {
            console.log(x, subst.get(x.name));
            return simplify(subst.get(x.name), subst);
        } else {
            return x;
        }
    } else if (x instanceof FuncType) {
        const param_types = x.param_types.map((p) => simplify(p, subst));
        const return_type = simplify(x.return_type, subst);
        return new FuncType(param_types, return_type);
    }
}

// ---

function pretty_type(idx) {
    console.assert(idx < 52);
    const names = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return names.at(idx);
}

function prettify_type_name(type, subst = new Map()) {
    if (type instanceof GenericType) {
        if (!subst.has(type.name)) {
            subst.set(type.name, pretty_type(subst.size));
        }

        return new GenericType(subst.get(type.name));
    } else if (type instanceof FuncType) {
        const params = type.param_types.map((p) => prettify_type_name(p, subst));
        const return_type = prettify_type_name(type.return_type, subst);

        return new FuncType(params, return_type);
    } else {
        return type;
    }
}

function get_expression_type(e) {
    assign_types(e, {});

    const equations = generate_type_equations(e);

    console.log(equations);

    const substitutions = unify_equations(equations);
    const y = simplify(e.type, substitutions);
    return prettify_type_name(y);
}

function print_equations(equations) {
    for (const [left, right] of equations) {
        console.log(`${left} = ${right}`);
    }
}

// @web
// -

function walk(ast, f) {
    f(ast);

    if (ast instanceof AstNode) {
        if (ast instanceof Lambda) {
            for (const param of ast.params) {
                walk(param, f);
            }
            walk(ast.body, f);
        } else if (ast instanceof IfElse) {
            walk(ast.cond, f);
            walk(ast.then, f);
            walk(ast.otherwise, f);
        } else if (ast instanceof Apply) {
            walk(ast.func, f);

            for (const arg of ast.args) {
                walk(arg, f);
            }
        } else {
            throw new Error('Unknown kind of AstNode object');
        }
    } else if (!(ast instanceof Number || ast instanceof Boolean || ast instanceof String)) {
        throw new Error('Unknown object in ast');
    }
}

function variables_to_string(ast) {
    let expr = [];
    walk(ast, (x) => expr.push(x));
    expr = expr.filter((x) => x.type instanceof GenericType);
    let free_type_variables = new Map(expr.map((x) => [x.type, x]));
    let keys = Array.from(free_type_variables.keys()).toSorted((a, b) => a.id - b.id);

    let out = '';
    for (const key of keys) {
        out += `${key} = ${free_type_variables.get(key)}\n`;
    }

    return out;
}

function equations_to_string(equations) {
    const left = [];
    const right = [];

    for (const [lhs, rhs] of equations) {
        left.push(lhs.toString());
        right.push(rhs.toString());
    }

    const width = left.map((x) => x.length).reduce((acc, x) => Math.max(acc, x));

    let out = '';
    for (let i = 0; i < left.length; i++) {
        const pad = width - left[i].length;
        out += `${left[i].padStart(width)} = ${right[i]}\n`;
    }

    return out;
}

function substitutions_to_string(substitutions) {
    let out = '';
    for (const [k,v] of substitutions.entries()) {
        out += `${k} = ${v}\n`;
    }

    return out;
}

function recompute() {
    type_generator.reset();

    const s = text.value;

    if (s.length === 0) {
        output.innerHTML = 'Nothing to do yet';
        return;
    }

    let out = '';

    try {
        const ast = parse(s);

        // Builtin functions
        const symbol_table = {};

        {
            const t = new GenericType();
            symbol_table[new String('=')] = new FuncType([t, t], new BoolType());
        }

        symbol_table[new String('+')] = new FuncType([new IntType(), new IntType()], new IntType());
        symbol_table[new String('-')] = new FuncType([new IntType(), new IntType()], new IntType());
        symbol_table[new String('*')] = new FuncType([new IntType(), new IntType()], new IntType());
        symbol_table[new String('/')] = new FuncType([new IntType(), new IntType()], new IntType());

        assign_types(ast, symbol_table);

        const variablesString = variables_to_string(ast);
        outVars.innerHTML = variablesString;

        const equations = generate_type_equations(ast);

        const equationsString = equations_to_string(equations);
        outEquations.innerHTML = equationsString;

        const substitutions = unify_equations(equations);

        const substitutionsString = substitutions_to_string(substitutions);
        outSubstitutions.innerHTML = substitutionsString;

        out += 'Type variables\n';
        out += '--------------\n';
        out += variablesString;
        out += '\n';
        out += "Type equations\n";
        out += "--------------\n";
        out += equationsString;
        out += '\n';
        out += 'Substitions found\n';
        out += '-----------------\n';
        out += substitutionsString;

        console.log(substitutions);

        const y = simplify(ast.type, substitutions);

        console.log(y);

        outGeneralType.innerHTML = y.toString();

        const type = prettify_type_name(y);

        outGeneralTypePretty.innerHTML = type.toString();

        out += '\n';
        out += 'Inferred type\n';
        out += '-------------\n';
        out += y.toString();
        out += '\n\n';
        out += 'Inferred type (prettified)\n';
        out += '------------------------\n';
        out += type.toString();

        console.log(out);
    } catch (err) {
        out += "ERROR: " + err.toString();
        console.log(out);
    }
}

let text, outVars, outEquations, outSubstitutions, outGeneralType, outGeneralTypePretty;

window.onload = () => {
    text                 = document.getElementById('code-input');
    outVars              = document.getElementById('outVars');
    outEquations         = document.getElementById('outEquations');
    outSubstitutions     = document.getElementById('outSubstitutions');
    outGeneralType       = document.getElementById('outGeneralType');
    outGeneralTypePretty = document.getElementById('outGeneralTypePretty');

    const prog1 = 'lambda f g x -> if (= x 0) then (f x) else g';
    const prog2 = 'lambda x -> 0';
    const prog3 = 'lambda f g x y -> 0';

    const setCode = (prog) => {
        text.value = prog;
        recompute();
    };

    const button1 = document.getElementById('button-1');
    button1.onclick = () => setCode(prog1);

    const button2 = document.getElementById('button-2');
    button2.onclick = () => setCode(prog2);

    const button3 = document.getElementById('button-3');
    button3.onclick = () => setCode(prog3);

    text.oninput = recompute;

    setCode(prog1);
};
