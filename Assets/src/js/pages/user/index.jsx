import '~css/pages/user/index.less';

import React from 'react';
import ReactDOM from 'react-dom';
import request from '~js/libs/request';
import { Switch, Icon } from 'antd';

request();

ReactDOM.render(
  <div>
    <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />
    <br />
    <Switch checkedChildren="1" unCheckedChildren="0" />
    <br />
    <Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} defaultChecked />
  </div>,
  document.getElementById('app')
);
