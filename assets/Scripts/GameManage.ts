import { _decorator, Component, Prefab, instantiate, Node, Vec3, Label } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE
}

enum GameState{
    GS_INIT,
    GS_PLAYING,
    GS_END,
}


@ccclass('GameManage')
export class GameManage extends Component {
    // 赛道预制体
    @property({type:Prefab})
    public cubePrfb : Prefab | null = null;
    // 赛道长度
    @property
    public roadLength = 60;
    private _road: BlockType[] = [];

    // 暴露出 PlayerController 基类并传入
    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null;
    // 暴露出 startMenu 节点并传入
    @property( { type: Node } )
    public startMenu: Node | null = null;
    // 暴露出 Steps 节点并传入
    @property( { type: Label } )
    public stepsLabel: Label | null = null;




    // 游戏开始的回调函数
    start() { 
        this.curState = GameState.GS_INIT;

        this.playerCtrl?.node.on('JumpEnd',this.onPlayerJumpEnd,this); // 接收到了PlayerCtrl传递的JumpEnd事件
    }
    
    init(){
        // 激活主界面
        if(this.startMenu){
            this.startMenu.active = true;
        }
        // 生成赛道
        this.gengerateRoad();
        if(this.playerCtrl){
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
        }
        this.playerCtrl.reset();
    }

    set curState( value: GameState ){
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                if(this.startMenu){
                    this.startMenu.active = false;
                }

                if(this.stepsLabel){
                    this.stepsLabel.string = '0'; // 将步数重置为0
                }


                // 设置 active 为 true 时会直接开始监听鼠标事件，此时鼠标抬起事件还未派发
                // 会出现的现象就是，游戏开始的瞬间人物已经开始移动
                // 因此，这里需要做延迟处理
                setTimeout(()=>{
                    if(this.playerCtrl){
                        this.playerCtrl.setInputActive(true)
                    }
                },0.1)


                break;
            case GameState.GS_END:
                
                this.gameEnd()
                break;
            default:
                break;
        }
    }

    onStartButtonClicked(){
        this.curState = GameState.GS_PLAYING;
    }

    checkResult(moveIndex: number){
        if(moveIndex < this.roadLength){
            if(this._road[moveIndex] == BlockType.BT_NONE){ // 证明跳跃结束后在间隙上
                this.curState = GameState.GS_END

                // 可以添加坠落动画
            }
        } else {
            // 跳过了最大长度
            this.curState = GameState.GS_END
        }
    }


    // 道路生成逻辑
    gengerateRoad(){
        // 清除旧赛道
        this.node.removeAllChildren();
        this._road = [];
        // 确保游戏开始时，人物在石块上
        this._road.push(BlockType.BT_STONE);

        // 根据长度生成赛道
        for (let i = 1; i < this.roadLength; i++) {
            // 如果上一个推入的是空白那么当前必须要是石块
            if(this._road[i-1] === BlockType.BT_NONE){
                this._road.push(BlockType.BT_STONE)
            } else { // 否则推入石块或者空白
                this._road.push(Math.floor( Math.random() * 2 ));
            }
        }
        

        for (let j = 0; j < this._road.length; j++) {
            let block: Node = this.spawnBlockByType(this._road[j])
            // 判断是否是道路
            if(block){
                this.node.addChild(block);
                block.setPosition(j, -1.5, 0);
            }
        }
    }


    // 石块生成逻辑
    spawnBlockByType(type:BlockType){
        if(!this.cubePrfb) return null;


        let block: Node | null = null;

        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrfb);
                break;
        }


        return block;

    }

    
    // 跳跃结束逻辑
    onPlayerJumpEnd(moveIndex:number){

        if(this.stepsLabel){
            // 因为在最后一步可能出现步伐大的跳跃，但是此时无论跳跃是步伐大还是步伐小都不应该多增加分数
            this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex)
        }

        this.checkResult(moveIndex)
    }

    // 游戏结束逻辑
    gameEnd(){
        this.playerCtrl.BodyAnim.play('drop');

        // this.init();
    }
    // update(deltaTime: number) {
        
    // }
}


