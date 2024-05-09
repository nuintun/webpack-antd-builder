/**
 * @module index
 */

import React, { memo, useCallback, useEffect, useState } from 'react';

import classNames from 'classnames';
import useStyles, { prefixCls } from './style';
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

function getFileList<T>(value: string[]): FileList<T> {
  return value.map(value => {
    return { uid: value, url: value, name: value, status: 'done', thumbUrl: value };
  });
}

export default memo(function ImageUpload<T extends UploadResponse>(props: ImageUploadProps<T>) {
  const {
    action,
    children,
    width = 96,
    height = 96,
    maxCount = 1,
    value: propsValue,
    accept = 'image/*',
    showUploadList = true,
    withCredentials = true
  } = props;

  const { message } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [scope, render] = useStyles();
  const [value = [], setValue] = useControllableValue<string[]>(props);
  const [fileList, setFileList] = useState<FileList<T>>(() => getFileList(value));

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

  useEffect(() => {
    if (propsValue) {
      setFileList(getFileList(propsValue));
    }
  }, [propsValue]);

  return render(
    <div className={classNames(scope, prefixCls)}>
      {showUploadList &&
        fileList.map(file => {
          const style = { width, height };
          const { response, uid, status, thumbUrl, percent = 0 } = file;

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
              <div key={uid} className={`${prefixCls}-done`} style={style}>
                <Image
                  alt="thumb"
                  width={width}
                  src={thumbUrl}
                  height={height}
                  fallback={fallback}
                  preview={{
                    mask: (
                      <div className={`${prefixCls}-mask`}>
                        <EyeOutlined title="预览" className="icon" />
                        <DeleteOutlined title="删除" className={`${prefixCls}-icon ${prefixCls}-delete`} onClick={remove} />
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
                className={`${prefixCls}-error`}
                title={`${response?.msg || '上传错误'}，请单击删除此文件`}
              >
                <WarningOutlined className={`${prefixCls}-icon`} />
                <span>
                  上传错误
                  <br />
                  悬停查看详情
                </span>
              </div>
            );
          }

          return (
            <div key={uid} className={`${prefixCls}-loading`} style={style}>
              <LoadingOutlined className={`${prefixCls}-icon`} />
              <span>{percent | 0}%</span>
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
              <button type="button" className={`${prefixCls}-action`}>
                <UploadOutlined className={`${prefixCls}-icon`} />
                <span>上传图片</span>
              </button>
            )}
          </div>
        )}
      </Upload>
    </div>
  );
});
