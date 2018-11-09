require('normalize.css/normalize.css');
require('../styles/common.css');
require('../styles/reset.css');
require('../styles/App.scss');
import Head from './head'
import React from 'react';
import $ from 'jquery';
import 'jplayer';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Player from './player';
import Pubsub from 'pubsub-js';
import MusicList from './MusicList';
import MUSIC_LIST from '../json/MusicData.json';

/*播放类型*/
let repeatIcon=['cycle','once','random'];

/*大管家,统领全局*/
class AppComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      repeatType:repeatIcon[0],//播放模式
      musicList:MUSIC_LIST,//列表
      currentMusicItem: MUSIC_LIST[0]//当前播放
    };
    this.findMusicIndex = this.findMusicIndex.bind(this);
    this.changeRepeat = this.changeRepeat.bind(this);
    this.findChangeRepeatIndex = this.findChangeRepeatIndex.bind(this);
  }
  /*播放音乐*/
  playMusic(musicItem){
    $('#player').jPlayer('setMedia',{
      mp3:musicItem.file
    }).jPlayer('play');
    this.setState({
      currentMusicItem:musicItem
    })
  }
  /*播放下一曲 || 上一曲*/
  playNext( type = 'next' ){
    let index = this.findMusicIndex(this.state.currentMusicItem);
    let newIndex = null;
    let musicListLength = this.state.musicList.length;
    //下
    if( type === 'next' ){
      newIndex = (index+1) % musicListLength;
    }else{
      /*防负数*/
      newIndex = (index-1+musicListLength) % musicListLength;
    }
    this.playMusic(this.state.musicList[newIndex]);
  }
  /*音乐的下标*/
  findMusicIndex(musicItem){
    return this.state.musicList.indexOf(musicItem);
  }
  /*挂载*/
  componentDidMount(){
    $('#player').jPlayer({
      supplied:'mp3',
      wmode:'window'
    });
    this.playMusic(this.state.currentMusicItem);

    //监听注册事件
    Pubsub.subscribe('DELETE_MUSIC',(msg,musicItem) => {
      this.setState({
        musicList:this.state.musicList.filter(item=>{
          return item !== musicItem;
        })
      });
    });
    Pubsub.subscribe('PLAL_MUSIC',(msg,musicItem) => {
      this.playMusic(musicItem);
    });
    Pubsub.subscribe('PLAY_PREV',() => {
      this.playNext('prev');
    });
    Pubsub.subscribe('PLAY_NEXT',() => {
      this.playNext();
    });
    Pubsub.subscribe('PLAY_REPEAT',() => {
      this.changeRepeat();
    });

    /*音乐播放完后的监听*/
    $('#player').bind($.jPlayer.event.ended,() => {
      let index = this.findChangeRepeatIndex(this.state.repeatType);
      if( index === 0 ){
        this.playNext();
      }else if( index === 1 ){
        this.playMusic(this.state.currentMusicItem);
      }else{
        let musicListLength = this.state.musicList.length;
        this.playMusic( this.state.musicList[Math.floor(Math.random()*musicListLength)] );
      }
    })
  }
  /*切换状态*/
  changeRepeat(){
    let index = this.findChangeRepeatIndex(this.state.repeatType);
    let newIndex = null;
    let RepeatListLength = repeatIcon.length;
    newIndex = newIndex = (index+1) % RepeatListLength;
    this.setState({
      repeatType:repeatIcon[newIndex]
    })
  }
  /*查找当前状态下标*/
  findChangeRepeatIndex(repeat){
    return repeatIcon.indexOf(repeat);
  }
  /*DOM销毁,树倒猢狲散*/
  componentWillUnmount(){
    Pubsub.unsubscribe('PLAL_MUSIC');
    Pubsub.unsubscribe('DELETE_MUSIC');
    Pubsub.unsubscribe('PLAY_PREV');
    Pubsub.unsubscribe('PLAY_NEXT');
    Pubsub.unsubscribe('PLAY_REPEAT');
    $('#player').unbind($.jPlayer.event.ended);
  }
  render() {
    return (
      <div>
        <Head />
        <HashRouter>
          <Switch>
            <Route exact path="/" render={ () =><Player currentMusicItem={this.state.currentMusicItem} repeatType={this.state.repeatType} repeatIcon={repeatIcon} /> } />
            <Route exact path="/list" render={ () =><MusicList currentMusicItem={this.state.currentMusicItem} musicList={this.state.musicList}/> } />
          </Switch>
        </HashRouter>
      </div>

    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
