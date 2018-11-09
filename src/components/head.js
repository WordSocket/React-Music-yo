import React from 'react';
/*头部*/
export default class Head extends React.Component {
  render() {
    return (
      <div className="components-header row">
        <img src="../images/logo.png" width="40" alt="" className="-col-auto"/>
        <h1 className="caption">React Music player</h1>
      </div>
    );
  }
}
