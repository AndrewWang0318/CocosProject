import { _decorator, Component, Node, input, Input, EventMouse, Vec3, Animation } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('PlayerController')
export class PlayerController extends Component {
  @property({ type: Animation })
  public BodyAnim: Animation | null = null;

  private _startJump: boolean = false; // 是否接受到跳跃命令
  private _jumpStep: number = 0; // 跳跃步长 

  private _curJumpTime:number = 0; // 当前跳跃时间
  private _jumpTime:number = 0.3; // 每次跳跃时间s 
  private _curJumpSpeed:number = 0; // 当前跳跃速度

  private _curPos: Vec3 = new Vec3(); // 当前角色位置
  private _deltaPos: Vec3 = new Vec3(0,0,0); // 跳跃过程中,当前帧移动位置差
  private _targetPos: Vec3 = new Vec3(); // 目标角色位置

  private _curMoveIndex:number = 0; // 跳跃步数

  start() {
    input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
  }

  setInputActive(active:boolean){
    if(active){
      input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
    }else{
      input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this)
    }
  }


  onMouseUp(evt: EventMouse) {
    const btnCode: number = evt.getButton();
    if (btnCode === 0) { // 按下了左键
      this.jumpByStep(1)
    } else if (btnCode === 2) { // 按下了右键
      this.jumpByStep(2)
    }
  }

  jumpByStep(step:number){
    if (this._startJump)  return; // 上一步未完成之时不可再次触发

    if(this.BodyAnim){
      if(step == 1){
        this.BodyAnim.play('oneStep')
      }else if(step == 2){
        this.BodyAnim.play('twoStep')
      }
    }
    this._startJump = true;
    this._jumpStep = step;
    this._curJumpTime = 0;
    this._curJumpSpeed = this._jumpStep / this._jumpTime;
    this.node.getPosition(this._curPos); // 将当前节点的位置储存到this._curPos中

    Vec3.add(this._targetPos,this._curPos,new Vec3(this._jumpStep, 0 , 0))

    this._curMoveIndex += step
  }

  onOnceJumpEnd(){
    this.node.emit("JumpEnd", this._curMoveIndex)
  }

  reset(){
    this._curMoveIndex = 0; // 跳跃步数置0
  }


  update(dt: number): void { // 60帧代表每秒执行60次
    if(this._startJump){
      this._curJumpTime += dt

      if(this._curJumpTime > this._jumpTime){ // 跳跃结束

        this.node.setPosition(this._targetPos); // 移动到目标位置
        this._startJump = false; // 标记跳跃结束
        
        this.onOnceJumpEnd();
      }else{ // 跳跃中

        this.node.getPosition(this._curPos); // 获取当前的位置
        this._deltaPos.x = this._curJumpSpeed * dt;
        Vec3.add(this._curPos, this._curPos, this._deltaPos)
        this.node.setPosition(this._curPos);

      }
    }
  }
}


