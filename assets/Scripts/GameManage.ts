import { _decorator, Component, Prefab, instantiate, Node, CCInteger, math } from 'cc';
const { ccclass, property } = _decorator;

enum BlockType {
    BT_NONE,
    BT_STONE
}


@ccclass('GameManage')
export class GameManage extends Component {
    // 赛道预制体
    @property({type:Prefab})
    public cubePrfb : Prefab | null = null;
    // 赛道长度
    @property
    public roadLength = 50;
    private _road: BlockType[] = [];

    start() {
        this.gengerateRoad(); // 生成道路
    }
    
     // 道路生成逻辑
    gengerateRoad(){
        // 清除旧赛道
        this.node.removeAllChildren();
        this._road = [];
        // 确保游戏开始时，人物在石块上
        this._road.push(BlockType.BT_STONE);

        // 根据长度生成赛道
        for (let i = 0; i < this.roadLength; i++) {
            // 如果上一个推入的是空白那么当前必须要是石块
            if(this._road[i-1] === BlockType.BT_NONE){
                this._road.push(BlockType.BT_STONE)
            } else { // 否则推入石块或者空白
                this._road.push(Math.floor( math.random() * 2 ))
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
        if(!this.cubePrfb) return ;


        let block: Node | null = null;

        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrfb);
                break;
            default:
                break;
        }


        return block

    }





    // update(deltaTime: number) {
        
    // }
}


