package server

import (
	"errors"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/pkg/fileutils"
)

var CopyCancelled = errors.New("Copy cancelled")

type CourseCopier interface {
	Copy(courseSlug string) error
	Progress() int
	Cancel()
}

type FileSystemCopier struct {
	from, to string
	cancel   chan bool
	copied   int
}

func NewFileSystemCopier(from, to string) *FileSystemCopier {
	return &FileSystemCopier{
		from,
		to,
		make(chan bool),
		0,
	}
}

func (f *FileSystemCopier) Copy(courseSlug string) error {
	fromDir := filepath.Join(f.from, courseSlug)
	toDir := filepath.Join(f.to, courseSlug)
	if err := os.MkdirAll(toDir, 0700); err != nil {
		return err
	}

	return filepath.Walk(fromDir, func(fromFilePath string, fi os.FileInfo, err error) error {
		select {
		case <-f.cancel:
			return CopyCancelled
		default:
			if err != nil {
				log.Printf("Error traversing folder %s: %s\n", fromFilePath, err)
				return nil
			}

			if fi.IsDir() {
				return nil
			}
			baseFilePath := strings.TrimPrefix(fromFilePath, fromDir)
			toFilePath := filepath.Join(toDir, baseFilePath)
			err := CopyFile(fromFilePath, toFilePath)
			if err == nil {
				f.copied++
			}
			return err
		}
	})
}

func (f *FileSystemCopier) Cancel() {
	f.cancel <- true
}

func (f *FileSystemCopier) Progress() int {
	return f.copied
}

// CopyFile copies a file from src to dst. If src and dst files exist, and are
// the same, then return success. Otherise, attempt to create a hard link
// between the two files. If that fail, copy the file contents from src to dst.
func CopyFile(src, dst string) (err error) {
	toDir, _ := filepath.Split(dst)
	if err := os.MkdirAll(toDir, 0700); err != nil {
		return err
	}

	sfi, err := os.Stat(src)
	if err != nil {
		return
	}

	dfi, err := os.Stat(dst)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("Error copying %s to %s: %s\n", src, dst, err)
			return
		}
	} else {
		if os.SameFile(sfi, dfi) {
			return
		}
	}

	err = fileutils.CopyFile(dst, src)
	return
}
