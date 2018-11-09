import React from 'react';
import $ from 'jquery';
import 'jplayer';
import {NavLink} from 'react-router-dom';
import Progress from './progress';
import Pubsub from 'pubsub-js';

/*音乐首页，主题模块*/
//时间
let duration = null;
export default class Player extends React.Component {
  constructor(props){
    super(props);
    this.play = this.play.bind(this);
    this.progressChange = this.progressChange.bind(this);
    this.changeVolumeHandler = this.changeVolumeHandler.bind(this);
    this.PlayPrev = this.PlayPrev.bind(this);
    this.PlayNext = this.PlayNext.bind(this);
    this.changeRepeat = this.changeRepeat.bind(this);
    this.formatTime = this.formatTime.bind(this);
    this.state = {
      progress: 0,//现在播放百分比
      volume: 0,//现在播放音量
      isPlay: true,//是否播放
      leftTime:''//剩余播放时间

    };
  }
  /*点击音乐进度条*/
  progressChange(progress){
    $('#player').jPlayer('play',duration * progress);
    /*如果音乐暂停则继续播放*/
    if( !(this.state.isPlay) ){
      this.play();
    }
  }
  /*播放模式*/
  changeRepeat(){
    Pubsub.publish('PLAY_REPEAT');
  }
  componentDidMount(){
    /*音乐正在播放*/
    $('#player').bind($.jPlayer.event.timeupdate,(e)=>{
      duration = e.jPlayer.status.duration;
      this.setState({
        volume: e.jPlayer.options.volume * 100,//播放音量
        progress:Math.round(e.jPlayer.status.currentPercentAbsolute),//播放百分比
        leftTime:duration * (1 - e.jPlayer.status.currentPercentAbsolute / 100)
      });
    })
  }
  /*暂停 | 播放*/
  play(){
    if( this.state.isPlay ){
      $('#player').jPlayer('pause');
    }else{
      $('#player').jPlayer('play');
    }
    this.setState({
      isPlay:!this.state.isPlay
    });
  }
  PlayPrev(){
    if( !(this.state.isPlay) ){
      this.play();
    }
    Pubsub.publish('PLAY_PREV');
  }
  PlayNext(){
    if( !(this.state.isPlay) ){
      this.play();
    }
    Pubsub.publish('PLAY_NEXT');
  }
  /*音量*/
  changeVolumeHandler(progress) {
    $('#player').jPlayer('volume', progress);
  }
  /*格式化时间*/
  formatTime(time){
    time = Math.floor(time);
    let miniuts = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    seconds = seconds < 10 ? `0${ seconds}` : seconds;
    return `${ miniuts} : ${seconds}`;
  }
  /*DOM销毁,树倒猢狲散*/
  componentWillUnmount(){
    $('#player').unbind();
  }
  render() {
    return (
      <div className="player-page">
        <div className="player-page">
          <h1 className="caption"><NavLink to="/list">我的私人音乐坊 &gt;</NavLink></h1>
          <div className="mt20 row">
            <div className="controll-wrapper">
              <h2 className="music-title">{this.props.currentMusicItem.title}</h2>
              <h3 className="music-artist mt10">{this.props.currentMusicItem.artist}</h3>
              <div className="row mt20">
                <div className="left-time -col-auto">-{this.formatTime(this.state.leftTime)}</div>
                <div className="volume-container">
                  <i className="icon-volume rt" style={{left: -5}}></i>
                  <div className="volume-wrapper">
                    {/*音量*/}
                    <Progress progress={this.state.volume} onProgressChange={this.changeVolumeHandler}/>
                  </div>
                </div>
              </div>
              <div style={{height: 10, lineHeight: '10px'}}>
                {/*进度条*/}
                <Progress progress={this.state.progress} onProgressChange={this.progressChange}/>
              </div>
              <div className="mt35 row">
                <div>
                  <i className="icon prev" onClick={this.PlayPrev}></i>
                  <i className={`icon ml20 ${this.state.isPlay ? 'pause' : 'play'}`} onClick={this.play}></i>
                  <i className="icon next ml20" onClick={this.PlayNext}></i>
                </div>
                <div className="-col-auto">
                  <i className={`icon repeat-${this.props.repeatType}`} onClick={this.changeRepeat}></i>
                </div>
              </div>
            </div>
            <div className="-col-auto cover">
              <img src={this.props.currentMusicItem.cover} alt={this.props.currentMusicItem.title}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
