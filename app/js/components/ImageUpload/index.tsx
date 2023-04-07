import useStyle, { prefixUI } from './style';

import React, { memo, useCallback, useState } from 'react';

import { App, Image, Upload, UploadProps } from 'antd';
import { useLocation, useNavigate } from 'react-nest-router';
import useControllableValue from '/js/hooks/useControllableValue';
import { DeleteOutlined, EyeOutlined, LoadingOutlined, UploadOutlined, WarningOutlined } from '@ant-design/icons';

import fallback from './image/fallback.svg?url';

const { useApp } = App;

interface UploadResponse {
  msg: string;
  code: number;
  payload: {
    uid: string;
    url: string;
  };
}

type FileList<T> = NonNullable<UploadProps<T>['fileList']>;
type OnChange<T> = NonNullable<UploadProps<T>['onChange']>;

export interface ImageUploadProps<T>
  extends Pick<React.CSSProperties, 'width' | 'height'>,
    Omit<UploadProps<T>, 'onChange' | 'listType' | 'itemRender'> {
  action: string;
  value?: string[];
  defaultValue?: string[];
  accept?: `image/${string}`;
  children?: React.ReactNode;
  onChange?: (value: string[]) => void;
}

export default memo(function ImageUpload<T extends UploadResponse>(props: ImageUploadProps<T>) {
  const {
    action,
    children,
    width = 96,
    height = 96,
    maxCount = 1,
    accept = 'image/*',
    showUploadList = true,
    withCredentials = true
  } = props;

  const { message } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { hashId, render } = useStyle();
  const [value = [], setValue] = useControllableValue<string[]>(props);
  const [fileList, setFileList] = useState<FileList<T>>(() => {
    return value.map(value => {
      return { url: value, thumbUrl: value, uid: value, name: value, status: 'done' };
    });
  });

  const onChange = useCallback<OnChange<T>>(
    ({ file, fileList }) => {
      const { status } = file;

      if (status !== 'done') {
        setFileList(fileList);

        if (status === 'removed') {
          const urls: string[] = [];

          for (const { url } of fileList) {
            if (url) {
              urls.push(url);
            }
          }

          setValue(urls);
        }
      } else {
        const { uid, response } = file;

        if (response) {
          const { code, payload } = response;

          if (code >= 200 && code < 300) {
            const urls: string[] = [];
            const files = fileList.map(file => {
              if (file.uid !== uid) {
                const { url } = file;

                if (url) {
                  urls.push(url);
                }

                return file;
              }

              const { url } = payload;

              urls.push(url);

              return { ...file, url, thumbUrl: url };
            });

            setValue(urls);
            setFileList(files);
          } else if (code === 401) {
            navigate('/login', {
              replace: true,
              state: location
            });
          } else {
            message.error(response.msg);
          }
        }
      }
    },
    [maxCount]
  );

  return render(
    <div className={`${hashId} ${prefixUI}`}>
      {showUploadList &&
        fileList.map(file => {
          const style = { width, height };
          const { response, uid, status, percent, thumbUrl } = file;

          const remove = (event: React.MouseEvent) => {
            event.stopPropagation();

            setFileList(fileList => {
              const files = fileList.filter(file => {
                return file.uid !== uid;
              });

              requestAnimationFrame(() => {
                onChange({
                  fileList: files,
                  file: { ...file, status: 'removed' }
                });
              });

              return files;
            });
          };

          if (status === 'done') {
            return (
              <div key={uid} className={`${prefixUI}-done`} style={style}>
                <Image
                  alt="thumb"
                  width={width}
                  src={thumbUrl}
                  height={height}
                  fallback={fallback}
                  preview={{
                    mask: (
                      <div className={`${prefixUI}-mask`}>
                        <EyeOutlined title="预览" className="icon" />
                        <DeleteOutlined title="删除" className={`${prefixUI}-icon ${prefixUI}-delete`} onClick={remove} />
                      </div>
                    )
                  }}
                />
              </div>
            );
          }

          if (status === 'error') {
            return (
              <div
                key={uid}
                style={style}
                onClick={remove}
                className={`${prefixUI}-error`}
                title={`${response?.msg || '上传错误'}，请单击删除此文件`}
              >
                <WarningOutlined className={`${prefixUI}-icon`} />
                <span>
                  上传错误
                  <br />
                  悬停查看详情
                </span>
              </div>
            );
          }

          return (
            <div key={uid} className={`${prefixUI}-loading`} style={style}>
              <LoadingOutlined className={`${prefixUI}-icon`} />
              <span>{percent}%</span>
            </div>
          );
        })}
      <Upload
        {...props}
        accept={accept}
        action={action}
        listType="picture"
        fileList={fileList}
        maxCount={maxCount}
        onChange={onChange}
        showUploadList={false}
        withCredentials={withCredentials}
      >
        {(!showUploadList || fileList.length < maxCount) && (
          <div style={{ width, height }}>
            {children || (
              <button type="button" className={`${prefixUI}-action`}>
                <UploadOutlined className={`${prefixUI}-icon`} />
                <span>上传图片</span>
              </button>
            )}
          </div>
        )}
      </Upload>
    </div>
  );
});
