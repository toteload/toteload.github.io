(import ./post)
(import ./util)

(defn build-ninja []
  (let [out @""
        posts (util/get-posts)]

    (defn write [& xs]
      (buffer/push-string out ;xs))

    (defn writeln [& xs]
      (write ;xs "\n"))

    (writeln ``# This file is generated. DO NOT EDIT! It will be overwritten.

OUT_DIR = docs

rule build_index
  command = janet build_index.janet $out

rule build_post_overview
  command = janet build_post_overview.janet $out

rule build_post
  command = janet build_post.janet $in $out

# On Windows the this command needs `cmd /c` otherwise it echoes the whole line instead of piping it into $out
rule build_cname
  command = cmd /c echo davidbos.me > $out

rule copy_file
  command = cp $in $out

build $OUT_DIR/assets/style.css: copy_file assets/style.css
build $OUT_DIR/assets/favicon.png: copy_file assets/favicon.png
build $OUT_DIR/assets/image-comparison-slider.js: copy_file assets/image-comparison-slider.js
build $OUT_DIR/CNAME: build_cname

# /
build $OUT_DIR/index.html: build_index | snippets/base.html snippets/index-content.html
build $OUT_DIR/assets/face.png: copy_file assets/face.png
``)

    (write ``
# /posts
build $OUT_DIR/posts/index.html: build_post_overview | snippets/base.html
``)

    (each {:path path} posts
      (write " " path "/main.post"))

    (writeln)
    (writeln)

    (each {:path path :name name :head head :body body} posts
      (writeln (string/format "# /posts/%s" name))
      (writeln (string/format "build $OUT_DIR/posts/%s/index.html: build_post %s/main.post | snippets/base.html snippets/post.html" name path))
      (let [{:locals locals} (post/dependencies head body)]
        (each x locals
          (writeln (string/format "build $OUT_DIR/posts/%s/%s: copy_file %s/%s" name x path x)))))

    # I don't know why carriage returns get inserted in the string. Maybe the string constants in
    # this file have them as well? I am not in the mood of figuring this out, so I just strip them
    # before writing out the build script. Stupid Windows...
    (spit "build.ninja" (util/strip-carriage-return out))
    (os/execute ["ninja"] :p)))

(build-ninja)
