(import ./post)
(import ./config)
(import ./util)

(def html-escape-peg 
  (peg/compile 
    '(% (any (+ (* "&"  (constant "&amp;"))
                (* "<"  (constant "&lt;"))
                (* ">"  (constant "&gt;"))
                (* "\"" (constant "&quot;"))
                (* "'"  (constant "&#39;"))
                '1)))))

(defn html-escape [x]
  (in (peg/match html-escape-peg x) 0))

(defn atoms [& xs]
  (fn [buf]
    (each f xs
      (f buf))))

(defn pair->attribute [(attr val)]
  (string attr "=\"" val "\""))

(defn html-tag [tag]
  (fn [f & xs]
    (def attr-pairs (pairs (table ;xs)))
    (def infinite-spaces (generate [_ :iterate true] " "))
    (def attr-str 
      (if (empty? xs)
          "" 
          (string 
            ;(interleave 
              infinite-spaces 
              (map pair->attribute attr-pairs)))))
    (fn [buf] 
      (buffer/push buf "<" tag attr-str ">")
      (f buf)
      (buffer/push buf "</" tag ">"))))

(defn noop [f & xs]
  (fn [buf] nil))

(defn text [s]
  (fn [buf] (buffer/push buf s)))

(defn code [f &keys {:lang lang :mode mode}]
  (default lang :generic)
  (default mode :inline)
  (def class (string "code-" mode))
  (fn [buf]
    (((html-tag "code") f :class class) buf)))

(defn image-comparison [f &keys {:left   left 
                                 :right  right 
                                 :width  width 
                                 :height height}]
  (fn [buf]
    (buffer/push 
      buf
      (string/format "<div class=\"cmp-slider\" style=\"width:min(100%%, %dpx); aspect-ratio:1/1;\">
                      <div class=\"cmp-img cmp-left\"><img draggable=\"false\" src=\"%s\" alt=\"TODO\"></div>
                      <div class=\"cmp-img cmp-right\"><img draggable=\"false\" src=\"%s\" alt=\"TODO\"></div>
                      <div class=\"cmp-divider\"></div>
                      </div>" width left right))))

(def transformers {:paragraph (html-tag "p")
                   :heading   (html-tag "h2")
                   :section   (html-tag "section")
                   :em        (html-tag "em")
                   :html      identity
                   :code      code
                   :image-comparison image-comparison})

(def html-escape-transformers 
  (do
    (def no-escape-transformers {:html true})
    (tabseq [k :keys transformers 
             :unless (has-key? no-escape-transformers k)] 
      k true)))

(defn atom->html [should-escape x]
  (let [{:name name :args args :body body} x
        body (or body [])
        args (or args [])
        f (transformers name)
        escape (or should-escape (has-key? html-escape-transformers name))]
    (cond
      (= (type body) :string) (text ((if escape html-escape identity) body))
      (nil? f) (errorf "Unknown atom %s" name)
      (f (atoms ;(map (partial atom->html escape) body)) ;args))))

(defn post->html [s]
  (def [head post] (post/parse s))
  (def f (atoms ;(map (partial atom->html false) post)))
  (def buf @"")
  (f buf)
  [head buf])

(defn post-html [{:year  year
                  :month month
                  :day   day
                  :name  name
                  :body  body
                  :head  {:title    title
                          :tags     tags
                          :includes includes}}]
  (defn tag-html [tag]
    (string "<span class=\"tag\">" tag "</span>"))

  (defn css-link-html [css-filename]
    (let [href (string "/posts/" name "/" css-filename)]
      (string/format "<link href=\"%s\" rel=\"stylesheet\">" href)))

  (let [post-html    (util/slurpr "snippets/post.html")
        publish-date (string/join [day month year] "-")
        publish-datetime (string/join [year month day] "-")
        css-html     (string ;(->> includes 
                                (filter |(string/has-suffix? ".css" $))
                                (map css-link-html)))
        tags-html    (if tags 
                       (string ;(map |(-> $ (string/ascii-lower) (tag-html)) tags)) 
                       "")
        body-html    (util/patch-html post-html {:title        title 
                                                 :publish-date publish-date 
                                                 :publish-datetime publish-datetime
                                                 :tags         tags-html
                                                 :content      body})
        layout       (util/slurpr "snippets/base.html")
        html         (util/patch-html layout {:title title 
                                              :head css-html
                                              :body body-html})]
    html))

(let [args (dyn *args*)
      path (args 1)
      out  (args 2)
      text (util/slurpr path)
      postname (util/penultimate (string/split "/" path))]
  (def [year month day name] (peg/match util/post-filename-peg postname))
  (def [head body] (post->html text))
  (def html (post-html {:head  head
                       :body  body
                       :year  year
                       :month month
                       :day   day
                       :name  name}))
  (spit out html))
