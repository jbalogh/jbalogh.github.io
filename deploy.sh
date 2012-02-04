#!/bin/sh

rm -rf _site && jekyll && rsync -avz _site/ jb:w/
