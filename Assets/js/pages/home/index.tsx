import styles from '/css/pages/home/index.module.less';

import { memo } from 'react';

export default memo(function Page() {
  return <p className={styles.main}>网站首页</p>;
});
