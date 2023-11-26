(import ./util)
(import ./post)

(defn posts-overview-html [posts]
  (defn post-item [{:year year :month month :day day :url url :head {:title title}}]
    (let [publish-date (string/join [day month year] "-")]
      (string/format "<div class=\"post-entry\">
                      <time>%s</time>
                      <a href=\"%s\">%s</a>
                      </div>" publish-date url title)))

  (defn year-block [year posts]
    (let [items (string ;(map post-item posts))]
      (string/format "<div class=\"year-block\">
                      <h2 class=\"post-year\">%s</h2>
                      %s
                      </div>" (string year) items)))

  (defn post-link-html [{:url url :head {:title title}}]
    (string/format "<a href=\"%s\">%s</a>" url title))

  (let [posts-by-year (group-by (fn [p] (scan-number (p :year))) posts)
        blocks-by-year (tabseq [[year posts] :pairs posts-by-year] 
                         year (year-block year posts))
        years         (-> blocks-by-year (keys) (sort) (reverse))
        overview-html (string ;(catseq [year :in years] (blocks-by-year year)))
        body-html     (string/format "<div id=\"posts-overview\">%s</div>" overview-html)
        layout        (util/slurpr "snippets/base.html")
        html          (util/patch-html layout {:title "Posts" :body body-html})]
    html))

(let [args    (dyn *args*)
      path    (args 1)
      posts   (util/get-posts)
      html    (posts-overview-html posts)]
  (spit path html))
