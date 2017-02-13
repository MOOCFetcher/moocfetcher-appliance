.PHONY: all watch clean pdf tex

OPTIONS := --latex-engine=lualatex

all: guide.pdf guide.tex

clean:
	rm -f guide.pdf guide.tex

watch:
	fswatch -o . | xargs -n 1 -I_ make

pdf: guide.md
	pandoc $(OPTIONS) guide.md -s -o guide.pdf 

tex: guide.md
	pandoc $(OPTIONS) guide.md  -s -o guide.tex 