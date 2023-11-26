(import ./config)
(import ./post)

(defn penultimate [x]
  (let [l (length x)]
    (if (< l 2)
      nil)
    (x (- l 2))))

(defn strip-carriage-return [s] 
  (string/replace-all "\r" "" s))

(defn slurpr [path]
  (strip-carriage-return (slurp path)))

(def- html-patch-peg 
  (peg/compile '(* "{:" (<- (some (if-not ":}" 1))) ":}")))

(defn patch-html [html lookup]
  (let [lut (fn [_ capture] (-> capture (string/trim) (keyword) (lookup)))]
    (peg/replace-all html-patch-peg lut html)))

(def post-filename-peg
  (peg/compile '{:d     (range "09")
                 :year  '(repeat 4 :d)
                 :month '(repeat 2 :d)
                 :day   '(repeat 2 :d)
                 :title '(some (+ (range "09" "az" "AZ") (set "_-")))
                 :main  (* :year "_" :month "_" :day "_" :title )}))

(defn get-posts []
  (def posts (os/dir config/posts-directory))
  (def matches (map (partial peg/match post-filename-peg) posts))
  (def values (catseq [i :range [0 (length posts)]
             :unless (nil? (matches i))]
      (let [[year month day name] (matches i)]
        (def path (string/join [config/posts-directory (posts i)] "/"))
        (def text (slurpr (string path "/main.post")))
        (def [head body] (post/parse text))
        (if (get head :draft false)
          nil
          {:year  year
           :month month
           :day   day
           :name  name
           :path  path
           :head  head
           :body  body
           :url   (string "/posts/" name)}))))
  (filter (fn [x] (-> x (nil?) (not))) values))

