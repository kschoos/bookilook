#!/bin/bash
gnome-terminal -e "babel --presets es2016,react -w src/ -d ."
gnome-terminal -e "babel --presets es2016,react -w public/src/ -d public/js/"
gnome-terminal -e "sass --watch src/sass:public/css"
