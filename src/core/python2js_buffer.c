#define PY_SSIZE_T_CLEAN
#include "Python.h"

#include "error_handling.h"
#include "python2js_buffer.h"
#include "types.h"

#include <endian.h>
#include <stdint.h>

#include "jslib.h"
#include "jsmemops.h"

// This file handles the conversion of Python buffer objects (which loosely
// represent Numpy arrays) to JavaScript.
// Converts everything to nested JavaScript arrays, where the scalars are
// standard JavaScript numbers (python2js_buffer_recursive)

// clang-format off
/**
 * A simple helper function that puts the arguments into a JavaScript object
 * (for readability) and looks up the conversion function, then calls into
 * python2js_buffer_recursive.
 */
EM_JS_VAL(JsVal, _python2js_buffer_inner, (
  void* buf,
  Py_ssize_t itemsize,
  int ndim,
  char* format,
  Py_ssize_t* shape,
  Py_ssize_t* strides,
  Py_ssize_t* suboffsets
), {
  // get_converter and _python2js_buffer_recursive defined in python2js_buffer.js
  let converter = Module.get_converter(format, itemsize);
  return Module._python2js_buffer_recursive(buf, 0, {
    ndim,
    format,
    itemsize,
    shape,
    strides,
    suboffsets,
    converter,
  });
});
// clang-format on

/**
 * Convert a buffer. To get the data out of the Py_buffer without relying on the
 * exact memory layout of Py_buffer, we need to do this in C. After pulling the
 * data out we call into the EM_JS helper _python2js_buffer_inner, which sets up
 * the base case for the recursion and then calls the main js function
 * _python2js_buffer_recursive (defined in python2js_buffer.js).
 */
JsVal
_python2js_buffer(PyObject* x)
{
  Py_buffer view;
  if (PyObject_GetBuffer(x, &view, PyBUF_FULL_RO) == -1) {
    return JS_ERROR;
  }
  // clang-format off
  JsVal result = _python2js_buffer_inner(
    view.buf,
    view.itemsize,
    view.ndim,
    view.format,
    view.shape,
    view.strides,
    view.suboffsets
  );
  // clang-format on
  PyBuffer_Release(&view);
  return result;
}
