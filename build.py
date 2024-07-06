import json
import subprocess
import os
import ninja_syntax as n
import re

POSTS = 'posts'

def list_posts():
    ps = []

    for p in os.listdir(POSTS):
        if not os.path.isdir(os.path.join(POSTS, p)):
            continue

        if not any(f == 'main.hpost' for f in os.listdir(os.path.join(POSTS, p))):
            continue

        ps.append(p)

    return ps

def post_json_from_folder(p):
    return os.path.join(POSTS, p + '.json')

def create_build_ninja():
    fout = open("build.ninja", "w")
    out = n.Writer(fout)

    out.rule(
        name    = 'compile_hpost',
        command = 'posthost build $in $out',
        )

    out.rule(
        name    = 'build_post',
        command = 'python post.py $in $out',
        )

    out.rule(
        name    = 'build_posts_index',
        command = 'python posts_index.py $in $out',
        )

    out.rule(
        name    = 'build_index',
        command = 'python index.py index.html',
        )

    out.build(
        outputs  = 'index.html',
        rule     = 'build_index',
        implicit = ['fragments/base.html', 'fragments/index.html'],
        )

    posts = list_posts()

    for post in posts:
        post_json = post_json_from_folder(post)

        out.build(
            outputs = post_json,
            rule    = 'compile_hpost',
            inputs  = os.path.join(POSTS, post, 'main.hpost'),
            )

        out.build(
            outputs = os.path.join(POSTS, post, 'index.html'),
            rule    = 'build_post',
            inputs  = post_json,
            implicit = ['post.py', 'fragments/base.html', 'fragments/post.html'],
            )

    out.build(
        outputs  = 'posts/index.html',
        rule     = 'build_posts_index',
        inputs   = list(map(post_json_from_folder, posts)),
        implicit = ['posts_index.py', 'fragments/base.html'],
        )

if __name__ == "__main__":
    create_build_ninja()    
    subprocess.run(["ninja"]);
