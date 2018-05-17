import '~css/pages/login/index.less';

import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'antd';
import request from '~js/libs/request';

request();

ReactDOM.render(
  <div>
    <Button type="primary">Primary</Button>
    <Button>Default</Button>
    <Button type="dashed">Dashed</Button>
    <Button type="danger">Danger</Button>
  </div>,
  document.getElementById('app')
);
