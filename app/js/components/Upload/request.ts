/**
 * @module request
 */

import { serialize } from '/js/utils/form';
import * as msgpack from '/js/utils/msgpack';
import { isJsonType, isMsgpackType, isStatusOk, RequestResult, resolveMessage } from '/js/utils/request';

interface RcFile extends File {
  uid: string;
}

type UploadRequestHeader = HeadersInit;

interface UploadRequestError extends Error {
  url?: string;
  status?: number;
  method?: UploadRequestMethod;
}

interface UploadProgressEvent extends ProgressEvent {
  percent?: number;
}

type BeforeUploadFileType = File | Blob | boolean | string;

type UploadRequestMethod = 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch';

type UploadRequestFile = Exclude<BeforeUploadFileType, File | boolean> | RcFile;

interface UploadRequestOption<T = any> {
  action: string;
  filename?: string;
  file: UploadRequestFile;
  withCredentials?: boolean;
  method: UploadRequestMethod;
  headers?: UploadRequestHeader;
  data?: Record<string, unknown>;
  onError?: (event: UploadRequestError | ProgressEvent, body?: T) => void;
  onProgress?: (event: UploadProgressEvent, file?: UploadRequestFile) => void;
  onSuccess?: (body: T, fileOrXhr?: UploadRequestFile | XMLHttpRequest) => void;
}

/**
 * @function parseResponse
 * @param response 响应内容
 */
function parseResponse<R>(xhr: XMLHttpRequest): RequestResult<R> {
  const contentType = xhr.getResponseHeader('Content-Type');

  if (isMsgpackType(contentType)) {
    const body: ArrayBuffer = xhr.response;
    const { code, message, payload } = msgpack.decode(body) as RequestResult<R>;

    return { code, message: message || resolveMessage(code), payload };
  } else if (isJsonType(contentType)) {
    const body: string = xhr.response;
    const { code, message, payload } = JSON.parse(body) as RequestResult<R>;

    return { code, message: message || resolveMessage(code), payload };
  }

  const { status } = xhr;
  const payload = xhr.responseText;
  const code = isStatusOk(status) ? 200 : status;

  return { code, message: resolveMessage(code), payload } as RequestResult<R>;
}

function getError(option: UploadRequestOption, xhr: XMLHttpRequest): UploadRequestError {
  const msg = `cannot ${option.method} ${option.action} ${xhr.status}'`;
  const error = new Error(msg) as UploadRequestError;

  error.status = xhr.status;
  error.url = option.action;
  error.method = option.method;

  return error;
}

export default function request(option: UploadRequestOption) {
  const xhr = new XMLHttpRequest();
  const { file, data = {}, filename = 'file' } = option;

  xhr.onerror = error => {
    option.onError?.(error);
  };

  if (option.onProgress && xhr.upload) {
    xhr.upload.onprogress = (event: UploadProgressEvent) => {
      if (event.total > 0) {
        event.percent = (event.loaded / event.total) * 100;
      }

      option.onProgress?.(event);
    };
  }

  xhr.onload = () => {
    const response = parseResponse(xhr);

    // allow success when 2xx status
    // see: https://github.com/react-component/upload/issues/34
    if (isStatusOk(xhr.status) && response.code === 200) {
      return option.onSuccess?.(response, xhr);
    }

    return option.onError?.(getError(option, xhr), response);
  };

  xhr.open(option.method, option.action, true);

  // has to be after `.open()`.
  // see: https://github.com/enyo/dropzone/issues/179
  if (option.withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true;
  }

  const headers = new Headers(option.headers);
  const entries = headers.entries();

  for (const [name, value] of entries) {
    xhr.setRequestHeader(name, value);
  }

  if (!headers.has('Accept')) {
    xhr.setRequestHeader('Accept', 'application/vnd.msgpack');
  }

  xhr.responseType = 'arraybuffer';

  const formData = serialize(data, new FormData());

  if (file instanceof File) {
    formData.append(filename, file, file.name);
  } else if (file instanceof Blob) {
    formData.append(filename, file, filename);
  } else {
    formData.append(filename, file);
  }

  xhr.send(formData);

  return {
    abort() {
      xhr.abort();
    }
  };
}
