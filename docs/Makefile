.PHONY: all watch clean

OPTIONS := --latex-engine=lualatex

all: guide.pdf guide.tex

clean:
	rm -f guide.pdf guide.tex

watch:
	fswatch -o . | xargs -n 1 -I_ make

guide.pdf: guide.md
	pandoc $(OPTIONS) guide.md -s -o guide.pdf 

guide.tex: guide.md
	pandoc $(OPTIONS) guide.md  -s -o guide.tex 
