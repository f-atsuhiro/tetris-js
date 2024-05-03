const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

//以下にutil関数
function rgb2Hex(r: number, g: number, b: number): string {
    // 各色成分を16進数に変換して2桁になるようゼロパディング
    const toHex = (component: number) => component.toString(16).padStart(2, '0');

    // HEXコード
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

//盤面の2次元配列(20*10)
//0-6:ミノの色
let field: Array<Array<number>> = new Array(21).fill(7).map(() => new Array(12).fill(7));
//端の要素を-1にする
for (let i = 0; i < 21; ++i){
    for (let j = 0; j < 12; ++j){
        if (j == 0 || i == 20 || j == 11){
            field[i][j] = -1;
        }
    }
}

function getXGridWidth(){
    return canvas.width / 40;
}
function getYGridHeight(){
    return canvas.height / 20;
}

let Rot:number = 0

const minoDat: Array<Array<Array<Array<number>>>> = [
    [
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
        [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    ],
    [
        [[1, 0, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [1, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
        [[1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    ],
    [
        [[0, 0, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [1, 1, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
        [[1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    ],
    [
        [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 1, 1], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
    ],
    [
        [[0, 0, 0, 0], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [0, 1, 1, 0], [0, 0, 1, 1], [0, 0, 0, 0]],
        [[0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    ],
    [
        [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
    ],
    [
        [[0, 0, 0, 0], [0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    ],
]
const minoColor: Array<string> = [
    rgb2Hex(0, 255, 255),//i
    rgb2Hex(30, 128, 255),//j
    rgb2Hex(255, 140, 0),//l
    rgb2Hex(255, 0, 0),//z
    rgb2Hex(0, 221, 0),//s
    rgb2Hex(255, 255, 0),//o
    rgb2Hex(255, 0, 255),//t
    rgb2Hex(85, 85, 85)//
]
let minoPlace: Array<number> = [getXGridWidth() * 4,0];
let nowMino = undefined;
const downSpeed = 4;
let timeDropping = 0;


class MoveMino{
    private _x: number;
    private _y: number;
    //コンストラクタ
    constructor(vartical: number, horizontal: number){
        this._x = horizontal;
        this._y = vartical;
        
    }
    Move(){
        //もし落下確定処理中にキーを押したら再度判定にする
        if (timeDropping != 0){
            timeDropping = 1;
        }
        //その位置に移動可能かを判定する(_xずらした位置)
        if (CheckCollision(Math.floor(minoPlace[0] / getXGridWidth()), Math.floor(minoPlace[1] / getYGridHeight()),nowMino,Rot,this._x, this._y)){
            return false;//移動できなかったら終了
        }
        minoPlace[0] += this._x * (getXGridWidth)();
        minoPlace[1] += this._y * (getYGridHeight() / 5);
        //もしy座標を1下げた時何かが存在しているなら座標を調整する
        if (CheckCollision(Math.floor(minoPlace[0] / getXGridWidth()), Math.floor(minoPlace[1] / getYGridHeight()),nowMino,Rot)){
            minoPlace[1] = Math.floor(minoPlace[1] / getYGridHeight()) * getYGridHeight() - (getYGridHeight() * (downSpeed/60));
            return false;
        }
        return true;
    }
}


let left = new MoveMino(0, -1);
let right = new MoveMino(0, 1);
let down = new MoveMino(1, 0);

function Rotation(direction : number){
    const oldRot: number = Rot;
    Rot = (Rot + direction) % 4;
    if (Rot < 0){
        Rot += 4;
    }
    //回転不可能なら元に戻す
    if (CheckCollision(Math.floor(minoPlace[0] / getXGridWidth()), Math.floor(minoPlace[1] / getYGridHeight()),nowMino,Rot)){
        Rot = oldRot;
    }
}

function keypress_ivent(event: KeyboardEvent) {
    if (event.key == 'a' || event.key == 'A'){
        left.Move();
    }
    if (event.key == 'd' || event.key == 'D'){
        right.Move();
    }
    if (event.key == 's' || event.key == 'S'){
        down.Move();
    }
    if (event.key == 'w' || event.key == 'W'){
        while(down.Move());//移動できなくなるまでhardDropを呼び出し
    }
    if (event.key == 'c' || event.key == 'C'){
        Rotation(1);
    }
    if (event.key == 'z' || event.key == 'Z'){
        Rotation(-1);
    }
}

document.addEventListener('keypress', keypress_ivent);

class GenNextMino{
    private static randMemory: Array<number> = [0,1,2,3,4,5,6];
    //乱数を生成(0~6)
    public static Create(){
        let _next = Math.floor(Math.random() * this.randMemory.length);
        let _retValue = this.randMemory[_next];
        //randMemoryから取り出した値を削除
        this.randMemory.splice(_next,1);
        //randMemoryの長さが0になったらrandMemoryを再設定
        if (this.randMemory.length == 0){
            this.randMemory = [0,1,2,3,4,5,6];
        }
        return _retValue;
    }
}

function GenerateInitMino(): Array<number>{
    let nextMino: Array<number> = new Array(6);
    for (let i = 0; i < 6; ++i){
        nextMino[i] = GenNextMino.Create();
    }
    return nextMino;
}

function DrawMino(minoNum:number,x:number,y:number,Rot:number = 0,bg:boolean = false,w:number = getXGridWidth(),h:number = getYGridHeight()){
    //mino番号に応じてx,yにsize(w,h)で描写する
    let mino: Array<Array<number>> = minoDat[minoNum][Rot];
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    for (let i = 0; i < 4; ++i){
        for (let j = 0; j < 4; ++j){
            if (mino[i][j] != 0){
                ctx.fillStyle = minoColor[minoNum];
                ctx.fillRect(x + j * w, y + i * h, w, h);
                ctx.strokeRect(x + j * w, y + i * h, w, h);
            }
            else{
                ctx.fillStyle = minoColor[7];
                if (bg){
                    ctx.fillRect(x + j * w, y + i * h, w, h);
                }
            }
        }
    }
    ctx.closePath();
}

function DrawNextMino(nextMino: Array<number>){
    //nextMinoを描画
    //nextの文字を表示
    ctx.beginPath();
    ctx.fillStyle = '#000000';
    ctx.font = '30px serif';
    ctx.fillText('Next', getXGridWidth() * 12.6, getYGridHeight() * 1.6);
    DrawMino(nextMino[0], getXGridWidth() * 11.6, getYGridHeight() * 2.3,  0, true);
    for (let i = 1; i < 6; ++i){
        DrawMino(nextMino[i], getXGridWidth() * 16.6, (getYGridHeight() * -1.3) + (i * getYGridHeight() * 3.3), 0, true, getXGridWidth() * 2 / 3 ,getYGridHeight() * 2 / 3);
    }
}


function CreateBackground(){
    let width = getXGridWidth();
    let height = getYGridHeight();
    for (let i = 1; i <= 10 ; ++i){
        for (let j = 0; j < 20 ; ++j){
            ctx.beginPath();
            ctx.fillStyle = minoColor[field[j][i]];
            ctx.fillRect((i - 1) * width, j * height, width, height);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect((i - 1) * width, j * height, width, height);
            ctx.closePath();
        }
    }
}

function CreateNowMino(nextMino: Array<number>){
    //先頭要素を現在のミノに
    nowMino = nextMino[0];
    //先頭要素の削除
    nextMino.shift();
    //最後の要素を追加
    nextMino.push(GenNextMino.Create());

}

function CheckCollision(x:number,y:number,nowMino:number,rot:number,addx:number = 0,addy:number = 1){
    const mino:Array<Array<number>> = minoDat[nowMino][rot];
    //もし下にミノが存在しているor盤面の外ならtrue
    for (let i = 0; i < 4; ++i){
        for (let j = 0; j < 4; ++j){
            if (mino[i][j] != 0 && field[y + addy + i][x + addx + j + 1] != 7){
                return true;
            }
        }
    }
    return false;
}

function isDelete(line:Array<number>){
    console.log(line)
    for (let i = 1; i < 11; ++i){
        if (line[i] == 7){//7が存在する時点で消えない
            return false;
        }
    }
    return true;
}

function GameLoop(){
    if (timeDropping == 0){
        //1px落下させる
        minoPlace[1] += getYGridHeight() * (downSpeed/60);
    }
    //背景を再描写する(実際の仕様は確認していないが後ろの図形は描写されたまま放置されていなさそう・・・？)
    //念のため後ろの図形を全部撤去
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //あんまり重くなさそうな挙動をしているので全描写
    CreateBackground();
    DrawNextMino(nextMino);
    //現在座標にミノを描画
    DrawMino(nowMino, minoPlace[0], minoPlace[1], Rot);
    //接触判定
    if (CheckCollision(Math.floor(minoPlace[0] / getXGridWidth()), Math.floor(minoPlace[1] / getYGridHeight()),nowMino,Rot)){
        if (timeDropping == 0){
            timeDropping = 10;//ちょっと待ってから確定する(もし、この間にsやwが押された場合即座に設置する)
        }
        --timeDropping;
        if (timeDropping == 0){
            //その場所にミノのデータを書き込む
            for (let i = 0; i < 4; ++i){
                for (let j = 0; j < 4; ++j){
                    if (minoDat[nowMino][Rot][i][j] != 0){
                        field[Math.floor(minoPlace[1] / getYGridHeight()) + i][Math.floor(minoPlace[0] / getXGridWidth()) + j + 1] = nowMino;
                    }
                }
            }
            //消えるかの判定をする
            for (let i = 19; i >= 0 ; --i){
                if(isDelete(field[i])){
                    field.splice(i,1);
                    field.unshift(new Array(12).fill(7));
                    //両端を-1に戻す
                    field[0][0] = -1;
                    field[0][11] = -1;
                }
            }
            CreateNowMino(nextMino);
            DrawNextMino(nextMino);
            Rot = 0;
            minoPlace = [getXGridWidth() * 4,0];
        }
        if (isGameOver()){
            alert("GAME OVER");
            //ページをリロード
            location.reload();
        }
    }
    else{
        timeDropping = 0;
    }
}

function isGameOver(){
    if (field[0][4] != 7 || field[0][5] != 7 || field[0][6] != 7 || field[0][7] != 7){
        return true;
    }
    return false;
}

function main(){
    CreateBackground();
    //初期位置描写
    CreateNowMino(nextMino);
    DrawNextMino(nextMino);
    setInterval(GameLoop, 20);
}

//ミノの初期生成
let nextMino: Array<number> = GenerateInitMino();
main();