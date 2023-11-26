(defn tag [name]
  `
  Creates a function that takes a string and returns a tuple where the first element is the `name`
  and the second element the string. Used in the post grammar.
  `
  (fn [s] [name s]))

(defn inner-string [s]
  `
  Expects a string and returns a string with the first and last character removed.
  Intended to remove quotation marks.
  `
  (string/slice s 1 -2))

(def- janet-grammar
  ~{:ws (set " \t\r\f\n\0\v")
    :readermac (set "';~,|")
    :symchars (+ (range "09" "AZ" "az" "\x80\xFF") (set "!$%&*+-./:<?=>@^_"))
    :token (some :symchars)
    :hex (range "09" "af" "AF")
    :escape (* "\\" (+ (set "ntrzfev0\"\\")
                       (* "x" :hex :hex)
                       (* "u" [4 :hex])
                       (* "U" [6 :hex])
                       (error (constant "bad escape"))))
    :comment (* "#" (any (if-not (+ "\n" -1) 1)))
    :symbol :token
    :keyword (* ":" (any :symchars))
    :constant (* (+ "true" "false" "nil") (not :symchars))
    :bytes (* "\"" (any (+ :escape (if-not "\"" 1))) "\"")
    :string :bytes
    :buffer (* "@" :bytes)
    :long-bytes {:delim (some "`")
                 :open (capture :delim :n)
                 :close (cmt (* (not (> -1 "`")) (-> :n) '(backmatch :n)) ,=)
                 :main (drop (* :open (any (if-not :close 1)) :close))}
    :long-string :long-bytes
    :long-buffer (* "@" :long-bytes)
    :number (drop (cmt (<- :token) ,scan-number))
    :raw-value (+ :comment :constant :number :keyword
                  :string :buffer :long-string :long-buffer
                  :parray :barray :ptuple :btuple :struct :dict :symbol)
    :value (* (any (+ :ws :readermac)) :raw-value (any :ws))
    :root (any :value)
    :root2 (any (* :value :value))
    :ptuple (* "(" :root (+ ")" (error "")))
    :btuple (* "[" :root (+ "]" (error "")))
    :struct (* "{" :root2 (+ "}" (error "")))
    :parray (* "@" :ptuple)
    :barray (* "@" :btuple)
    :dict (* "@" :struct)
    :main :root})

(def post-grammar (merge janet-grammar
  ~{:body (/ (+ (* "{" (group (any (+ :comment :atom-root :text))) "}")
                (* "|{" (group :raw-text) "}|"))
            ,(tag :body))
    :raw-text     (/ '(any (if-not "}|" 1)) ,|(table :name :raw-text :body $))
    :text         (/ '(some (if-not (set "@}") 1)) ,|(table :name :text :body $))
    :name         (/ ':token ,|(-> $ (keyword) ((tag :name))))
    :args         (/ ':btuple ,|(-> $ (eval-string) ((tag :args))))
    :atom-raw     (* "@" (/ ':string ,|(table :name :raw-text :body (inner-string $))))
    :atom         (/ (group (* "@" :name (? :args) (? :body))) ,|(from-pairs $))
    :atom-root    (+ :atom-raw :atom)
    :post-header  (/ ':struct ,eval-string)
    :post-body    (any (* (any :ws) (+ :comment :atom-root)))
    :main         (* :post-header (group :post-body))}))

(def post-peg (peg/compile post-grammar))

(defn search-dependencies [x]
  (if (indexed? x)
    nil
    (let [{:name name :args args :body body} x]
      ()
      nil)))

(defn dependencies [{:includes includes} body]
  # TODO(david) search the post to see if any features are used that require dependencies
  {:locals includes})

(defn parse [text]
  (peg/match post-peg text))
