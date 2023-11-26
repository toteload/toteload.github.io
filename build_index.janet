(import ./util)

(let [args    (dyn *args*)
      content (util/slurpr "snippets/index-content.html")
      layout  (util/slurpr "snippets/base.html")
      html    (util/patch-html layout {:title "David Bos" :body content})
      path    (args 1)]
  (spit path html))
