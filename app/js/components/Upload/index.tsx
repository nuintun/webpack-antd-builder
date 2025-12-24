/**
 * @module index
 */

import {
  DeleteOutlined,
  EyeOutlined,
  LoadingOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import {
  App,
  ConfigProvider,
  GetProp,
  Image,
  Popconfirm,
  Tooltip,
  Upload as AntdUpload,
  UploadFile,
  UploadProps as AntdUploadProps
} from 'antd';
import clsx from 'clsx';
import request from './request';
import useStyles, { prefixCls } from './style';
import { useLocation, useNavigate } from 'react-nest-router';
import useControllableValue from '/js/hooks/useControllableValue';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import fallback from './images/fallback.png';
import placeholder from './images/placeholder.png';

export { prefixCls, fallback, placeholder };

const { useApp } = App;
const { Dragger } = AntdUpload;

interface UploadResponse {
  message: string;
  code: number;
  payload: {
    url: string;
    thumbUrl?: string;
  };
}

interface RenderFileContext {
  index: number;
  remove: () => void;
  node: React.ReactNode;
  style: React.CSSProperties;
}

type FileList<T> = GetProp<AntdUploadProps<T>, 'fileList'>;
type OnChange<T> = GetProp<AntdUploadProps<T>, 'onChange'>;

export interface GetThumbImage {
  (url: string, thumbUrl?: string): string;
}

export interface RenderFile {
  (file: UploadFile, context: RenderFileContext): React.ReactNode;
}

export interface UploadProps<T>
  extends
    Pick<React.CSSProperties, 'width' | 'height' | 'aspectRatio'>,
    Omit<AntdUploadProps<T>, 'styles' | 'onChange' | 'listType' | 'itemRender' | 'classNames' | 'rootClassName'> {
  action: string;
  accept?: string;
  value?: string[];
  defaultValue?: string[];
  renderFile?: RenderFile;
  children?: React.ReactNode;
  getThumbImage?: GetThumbImage;
  onChange?: (value: string[]) => void;
}

const defaultGetThumbImage: GetThumbImage = (url, thumbUrl) => {
  return new URL(thumbUrl ?? url, self.location.href).href;
};

const defaultRenderFile: RenderFile = (file, { style, remove }) => {
  const { uid, status } = file;

  if (status === 'uploading') {
    const { percent = 0 } = file;

    return (
      <div key={uid} style={style} className={`${prefixCls}-loading`}>
        <LoadingOutlined className={`${prefixCls}-icon`} />
        <span>{percent | 0}%</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div key={uid} style={style} className={`${prefixCls}-error`}>
        <WarningOutlined className={`${prefixCls}-icon`} />
        <span>上传错误</span>
        <div className={`${prefixCls}-mask`}>
          <Tooltip title={`${file.response?.message || '上传错误'}`}>
            <span className={`${prefixCls}-warn`}>
              <WarningOutlined />
              消息
            </span>
          </Tooltip>
          <span className={`${prefixCls}-delete`} onClick={remove}>
            <DeleteOutlined onClick={remove} />
            删除
          </span>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    const onClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
    };

    const mask = (
      <div className={`${prefixCls}-mask`}>
        <span className={`${prefixCls}-eye`}>
          <EyeOutlined />
          预览
        </span>
        <Popconfirm
          title="警告"
          onConfirm={remove}
          placement="topRight"
          onPopupClick={onClick}
          description="确认删除该文件吗?"
          icon={<QuestionCircleOutlined />}
        >
          <span onClick={onClick} className={`${prefixCls}-delete`}>
            <DeleteOutlined />
            删除
          </span>
        </Popconfirm>
      </div>
    );

    return (
      <div key={uid} style={style} className={`${prefixCls}-done`}>
        <Image
          alt="thumb"
          fallback={fallback}
          src={file.thumbUrl ?? file.url}
          preview={{ mask, src: file.url }}
          className={`${prefixCls}-preview`}
          placeholder={<img src={placeholder} className={`${prefixCls}-placeholder`} />}
        />
      </div>
    );
  }
};

function getFileList<T>(value: string[], getThumbImage: GetThumbImage): FileList<T> {
  return value.map(value => {
    return {
      uid: value,
      url: value,
      name: value,
      status: 'done',
      thumbUrl: getThumbImage(value)
    };
  });
}

export default memo(function Upload<T extends UploadResponse>(props: UploadProps<T>) {
  const {
    style,
    accept,
    action,
    height,
    children,
    className,
    maxCount = 1,
    width = '100%',
    value: propsValue,
    showUploadList = true,
    aspectRatio = '16 / 9',
    withCredentials = true,
    renderFile = defaultRenderFile,
    getThumbImage = defaultGetThumbImage,
    ...restProps
  } = props;

  const scope = useStyles();
  const { message } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const uploadURL = useMemo(() => new URL(action, self.location.href).href, [action]);
  const [value, setValue] = useControllableValue<string[]>(props, { defaultValue: [] });
  const [fileList, setFileList] = useState<FileList<T>>(() => getFileList(value, getThumbImage));

  const itemStyle = useMemo(() => {
    return {
      width,
      height,
      aspectRatio,
      overflow: 'hidden'
    };
  }, [width, height, aspectRatio]);

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

          if (code === 200) {
            const urls: string[] = [];
            const { url, thumbUrl } = payload;

            const files = fileList.map(file => {
              if (file.uid !== uid) {
                const { url } = file;

                if (url) {
                  urls.push(url);
                }

                return file;
              }

              urls.push(url);

              return { ...file, url, thumbUrl: getThumbImage(url, thumbUrl) };
            });

            setValue(urls);
            setFileList(files);
          } else if (code === 401) {
            navigate('/login', {
              replace: true,
              state: location
            });
          } else {
            setFileList(fileList);

            message.error(response.message);
          }
        }
      }
    },
    [maxCount]
  );

  useEffect(() => {
    if (propsValue) {
      setFileList(getFileList(propsValue, getThumbImage));
    }
  }, [propsValue]);

  return (
    <div style={style} className={clsx(scope, prefixCls, className)}>
      {showUploadList &&
        fileList.map((file, index) => {
          const { uid } = file;

          const remove = () => {
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

          return renderFile(file, {
            index,
            remove,
            style: itemStyle,
            get node() {
              return defaultRenderFile(file, {
                index,
                remove,
                node: null,
                style: itemStyle
              });
            }
          });
        })}
      <ConfigProvider
        theme={{
          components: {
            Upload: {
              padding: 0
            }
          }
        }}
      >
        <Dragger
          {...restProps}
          accept={accept}
          style={itemStyle}
          action={uploadURL}
          listType="picture"
          fileList={fileList}
          maxCount={maxCount}
          onChange={onChange}
          showUploadList={false}
          customRequest={request}
          height={height as number}
          withCredentials={withCredentials}
          className={clsx(`${prefixCls}-input`, {
            [`${prefixCls}-hidden`]: showUploadList && fileList.length >= maxCount
          })}
        >
          {children || (
            <div className={`${prefixCls}-action`}>
              <PlusOutlined className={`${prefixCls}-icon`} />
              <span>上传文件</span>
            </div>
          )}
        </Dragger>
      </ConfigProvider>
    </div>
  );
});
