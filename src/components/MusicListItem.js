import React from 'react';
/*事件订阅*/
import Pubsub from 'pubsub-js';

/*音乐列表每一项模块*/
export default class MusicListItem extends React.Component {
  //订阅事件
  playMusic(musicItem){
    Pubsub.publish('PLAL_MUSIC',musicItem)
  }
  //订阅事件
  deleteMusic(musicItem,e){
    e.stopPropagation();
    Pubsub.publish('DELETE_MUSIC',musicItem)
  }
  render() {
    let musicItem = this.props.musicItem;
    let deleteStr = '';
    if( !this.props.focus ){
      deleteStr = <p className='-col-auto delete' onClick={ this.deleteMusic.bind(this,musicItem) } ></p>;
    }
    return (
      <li className={ `components-listitem row ${this.props.focus ? 'focus' : '' }` } onClick={ this.playMusic.bind(this,musicItem) }>
        <p><strong>{musicItem.title} - {musicItem.artist}</strong></p>
        {deleteStr}
      </li>
    )
  }
}
