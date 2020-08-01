#!/bin/bash

LC_CTYPE=C && LANG=C && cut -c16-66 ./poblaciones_original_2019.txt | \
sed -e 's/[[:space:]]*$//' | \
sort -u | \
sort -R > ./poblaciones.txt