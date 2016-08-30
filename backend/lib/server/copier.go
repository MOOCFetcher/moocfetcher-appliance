package server

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

var CopyCancelled = errors.New("Copy cancelled")

type CourseCopier interface {
	Copy(courseSlug string) error
	Cancel()
}

type FileSystemCopier struct {
	from, to string
	cancel   chan bool
}

func NewFileSystemCopier(from, to string) *FileSystemCopier {
	return &FileSystemCopier{
		from,
		to,
		make(chan bool),
	}
}

func (f *FileSystemCopier) Copy(courseSlug string) error {
	fromDir := fmt.Sprintf("%s/%s", f.from, courseSlug)
	toDir := fmt.Sprintf("%s/%s", f.to, courseSlug)
	if err := os.MkdirAll(toDir, 0700); err != nil {
		return err
	}

	return filepath.Walk(fromDir, func(fromFilePath string, fi os.FileInfo, err error) error {
		select {
		case <-f.cancel:
			return CopyCancelled
		default:
			if fi.IsDir() {
				return nil
			}
			baseFilePath := strings.TrimPrefix(fromFilePath, fromDir)
			baseFilePath = strings.TrimPrefix(baseFilePath, "/")
			toFilePath := fmt.Sprintf("%s/%s", toDir, baseFilePath)
			return CopyFile(fromFilePath, toFilePath)
		}
	})
}

func (f *FileSystemCopier) Cancel() {
	f.cancel <- true
}

// CopyFile copies a file from src to dst. If src and dst files exist, and are
// the same, then return success. Otherise, attempt to create a hard link
// between the two files. If that fail, copy the file contents from src to dst.
func CopyFile(src, dst string) (err error) {
	sfi, err := os.Stat(src)
	if err != nil {
		return
	}
	if !sfi.Mode().IsRegular() {
		// cannot copy non-regular files (e.g., directories,
		// symlinks, devices, etc.)
		return fmt.Errorf("CopyFile: non-regular source file %s (%q)", sfi.Name(), sfi.Mode().String())
	}
	dfi, err := os.Stat(dst)
	if err != nil {
		if !os.IsNotExist(err) {
			return
		}
	} else {
		if !(dfi.Mode().IsRegular()) {
			return fmt.Errorf("CopyFile: non-regular destination file %s (%q)", dfi.Name(), dfi.Mode().String())
		}
		if os.SameFile(sfi, dfi) {
			return
		}
	}

	err = copyFileContents(src, dst)
	return
}

// copyFileContents copies the contents of the file named src to the file named
// by dst. The file will be created if it does not already exist. If the
// destination file exists, all it's contents will be replaced by the contents
// of the source file.
func copyFileContents(src, dst string) (err error) {
	in, err := os.Open(src)
	if err != nil {
		return
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return
	}
	defer func() {
		cerr := out.Close()
		if err == nil {
			err = cerr
		}
	}()
	if _, err = io.Copy(out, in); err != nil {
		return
	}
	err = out.Sync()
	return
}
