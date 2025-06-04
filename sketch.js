// Constantes do jogo
const TAMANHO_TILE = 32;
const DURACAO_DIA = 180; // 3 minutos de jogo por dia
const GASTO_ENERGIA = 0.25; // Energia gasta por segundo ao mover
const REGENERACAO_ENERGIA = 1.5; // Energia regenerada por segundo em casa
const VALORES_LIXO = [1, 2, 5]; // Valores para plástico, metal, eletrônico

// Estados do jogo
const ESTADOS_JOGO = {
  MENU: 0,
  JOGANDO: 1,
  LOJA: 2,
  TUTORIAL: 3,
  CREDITOS: 4
};

// Estado do jogo
let jogo = {
  estado: ESTADOS_JOGO.MENU, // menu, jogando, loja, tutorial, creditos
  tempo: 0,
  dia: 1,
  pausado: false
};

// Jogador
let elias = {
  x: 300,
  y: 300,
  velocidade: 2.8,
  frame: 0,
  direcao: "baixo",
  movendo: false,
  inventario: [],
  maxInventario: 5,
  dinheiro: 100,
  energia: 100,
  maxEnergia: 100,
  melhorias: {
    saco: { nivel: 0, custo: 50 },
    ferramentas: { nivel: 0, custo: 75 },
    resistencia: { nivel: 0, custo: 100 },
    casa: { nivel: 0, custo: 200 }
  }
};

// Mapa e objetos
let mapa = {
  largura: 30,
  altura: 20,
  tiles: [],
  arvores: [], // Árvores fixas
  pedras: [], // Pedras no mapa
  casa: { x: 5, y: 5, largura: 3, altura: 3 },
  centroReciclagem: { x: 25, y: 15, largura: 2, altura: 2 },
  rio: [], // Rio no mapa
  ponte: { x: 15, y: 10, largura: 3, altura: 1 } // Ponte sobre o rio
};

// Lixo no mapa
let lixo = [];
const TIPOS_LIXO = {
  PLASTICO: 0,
  METAL: 1,
  ELETRONICO: 2
};

// Cores para os tipos de lixo
const CORES_LIXO = [
  [255, 255, 0],   // Amarelo (plástico)
  [192, 192, 192], // Prata (metal)
  [100, 255, 100]  // Verde (eletrônico)
];

function setup() {
  createCanvas(960, 640);
  gerarMapa();
  gerarLixo(15);
  frameRate(60);
}

function draw() {
  if (jogo.pausado && jogo.estado !== ESTADOS_JOGO.MENU) return;
  
  background(135, 206, 235); // Céu
  
  switch (jogo.estado) {
    case ESTADOS_JOGO.MENU:
      desenharMenu();
      break;
    case ESTADOS_JOGO.JOGANDO:
      desenharMapa();
      atualizarJogo();
      desenharUI();
      break;
    case ESTADOS_JOGO.LOJA:
      desenharMapa();
      desenharLoja();
      desenharUI();
      break;
    case ESTADOS_JOGO.TUTORIAL:
      desenharTutorial();
      break;
    case ESTADOS_JOGO.CREDITOS:
      desenharCreditos();
      break;
  }
}

function desenharMenu() {
  // Fundo do menu
  fill(0, 0, 0, 200);
  rect(width/2 - 200, height/2 - 150, 400, 300);
  
  // Título do jogo
  fill(255);
  textSize(32);
  text("Elias - O Catador", width/2 - 150, height/2 - 100);
  
  // Botões
  desenharBotao("Jogar", width/2 - 80, height/2 - 50, 160, 50);
  desenharBotao("Tutorial", width/2 - 80, height/2 + 20, 160, 50);
  desenharBotao("Créditos", width/2 - 80, height/2 + 90, 160, 50);
}

function desenharTutorial() {
  // Fundo do tutorial
  fill(0, 0, 0, 200);
  rect(width/2 - 250, height/2 - 200, 500, 400);
  
  // Título
  fill(255);
  textSize(24);
  text("Como Jogar", width/2 - 70, height/2 - 170);
  
  // Instruções
  textSize(16);
  text("- Use WASD ou setas para mover Elias", width/2 - 230, height/2 - 130);
  text("- Pressione E para coletar lixo próximo", width/2 - 230, height/2 - 100);
  text("- Vá ao centro de reciclagem (♻) e pressione V para vender", width/2 - 230, height/2 - 70);
  text("- Em casa (sua casa marrom), pressione U para upgrades", width/2 - 230, height/2 - 40);
  text("- Gerencie sua energia para coletar mais lixo", width/2 - 230, height/2 - 10);
  text("- Cada dia dura 3 minutos e depois novos lixos aparecem", width/2 - 230, height/2 + 20);
  
  // Botão Voltar
  desenharBotao("Voltar", width/2 - 50, height/2 + 100, 100, 40);
}

function desenharCreditos() {
  // Fundo dos créditos
  fill(0, 0, 0, 200);
  rect(width/2 - 200, height/2 - 100, 400, 200);
  
  // Título
  fill(255);
  textSize(24);
  text("Créditos", width/2 - 50, height/2 - 70);
  
  // Créditos
  textSize(16);
  text("Criado e desenvolvido por:", width/2 - 180, height/2 - 30);
  text("Matheus C. Balbinot", width/2 - 100, height/2);
  text("Colégio Est. Cristo Rei, 1 ano B", width/2 - 150, height/2 + 30);
  text("Francisco Beltrão-PR", width/2 - 100, height/2 + 60);
  text("Professor Eduardo - Projeto Agrinho", width/2 - 150, height/2 + 90);
  
  // Botão Voltar (ajustado para ficar alinhado)
  desenharBotao("Voltar", width/2 - 50, height/2 + 120, 100, 40);
}

function desenharBotao(rotulo, x, y, w, h) {
  // Verifica se o mouse está sobre o botão
  const sobreBotao = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
  
  // Desenha o botão
  fill(sobreBotao ? [100, 200, 100] : [50, 150, 50]);
  rect(x, y, w, h, 10);
  
  // Texto do botão
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text(rotulo, x + w/2, y + h/2);
  textAlign(LEFT, BASELINE);
}

// Geração do mapa (fixo)
function gerarMapa() {
  // Gerar tiles básicos (grama como padrão)
  for (let y = 0; y < mapa.altura; y++) {
    mapa.tiles[y] = [];
    for (let x = 0; x < mapa.largura; x++) {
      mapa.tiles[y][x] = 1; // Grama como padrão
    }
  }

  // Gerar rio sinuoso
  gerarRio();

  // Adicionar terra e caminhos
  for (let y = 3; y < mapa.altura - 3; y++) {
    for (let x = 3; x < mapa.largura - 3; x++) {
      // Evitar colisão com rio e construções
      if (!ehTileRio(x, y) && 
          !(x >= mapa.casa.x && x < mapa.casa.x + mapa.casa.largura &&
            y >= mapa.casa.y && y < mapa.casa.y + mapa.casa.altura) &&
          !(x >= mapa.centroReciclagem.x && x < mapa.centroReciclagem.x + mapa.centroReciclagem.largura &&
            y >= mapa.centroReciclagem.y && y < mapa.centroReciclagem.y + mapa.centroReciclagem.altura)) {
        
        if (random() < 0.3) {
          mapa.tiles[y][x] = 0; // Terra
        }
      }
    }
  }
  
  // Criar caminho principal
  criarCaminho(mapa.casa.x + 1, mapa.casa.y + 1, mapa.centroReciclagem.x, mapa.centroReciclagem.y);
  
  // Adicionar ponte
  for (let x = mapa.ponte.x; x < mapa.ponte.x + mapa.ponte.largura; x++) {
    for (let y = mapa.ponte.y; y < mapa.ponte.y + mapa.ponte.altura; y++) {
      if (y >= 0 && y < mapa.altura && x >= 0 && x < mapa.largura) {
        mapa.tiles[y][x] = 4; // Ponte
      }
    }
  }
  
  // Adicionar árvores e pedras
  for (let y = 0; y < mapa.altura; y++) {
    for (let x = 0; x < mapa.largura; x++) {
      // Não colocar em construções, rio ou caminhos
      if (mapa.tiles[y][x] === 1 && random() < 0.1 && 
          !ehTileRio(x, y) &&
          !(x >= mapa.casa.x && x < mapa.casa.x + mapa.casa.largura &&
            y >= mapa.casa.y && y < mapa.casa.y + mapa.casa.altura) &&
          !(x >= mapa.centroReciclagem.x && x < mapa.centroReciclagem.x + mapa.centroReciclagem.largura &&
            y >= mapa.centroReciclagem.y && y < mapa.centroReciclagem.y + mapa.centroReciclagem.altura)) {
            
        if (random() < 0.7) {
          mapa.arvores.push({
            x: x * TAMANHO_TILE + TAMANHO_TILE/2,
            y: y * TAMANHO_TILE + TAMANHO_TILE/2
          });
        } else {
          mapa.pedras.push({
            x: x * TAMANHO_TILE + TAMANHO_TILE/2,
            y: y * TAMANHO_TILE + TAMANHO_TILE/2
          });
        }
      }
    }
  }
}

function gerarRio() {
  // Gerar um rio sinuoso que atravessa o mapa
  let startY = floor(random(5, mapa.altura - 5));
  let direcao = random() > 0.5 ? 1 : -1;
  
  for (let x = 0; x < mapa.largura; x++) {
    // Mudar direção ocasionalmente
    if (random() < 0.2) {
      direcao = random() > 0.5 ? 1 : -1;
    }
    
    // Manter dentro dos limites
    startY = constrain(startY + direcao, 3, mapa.altura - 4);
    
    // Criar o rio com largura variável
    for (let y = startY - 1; y <= startY + 1; y++) {
      if (y >= 0 && y < mapa.altura) {
        mapa.rio.push({x: x, y: y});
        mapa.tiles[y][x] = 3; // Água
      }
    }
  }
}

function ehTileRio(x, y) {
  return mapa.rio.some(tile => tile.x === x && tile.y === y);
}

function criarCaminho(startX, startY, endX, endY) {
  let x = startX;
  let y = startY;
  
  // Primeiro mover na horizontal, depois na vertical
  while (x !== endX) {
    mapa.tiles[y][x] = 2; // Caminho
    if (x < endX) x++;
    else if (x > endX) x--;
  }
  
  while (y !== endY) {
    mapa.tiles[y][x] = 2; // Caminho
    if (y < endY) y++;
    else if (y > endY) y--;
  }
  
  mapa.tiles[endY][endX] = 2; // Caminho
}

function desenharMapa() {
  // Desenhar tiles base
  for (let y = 0; y < mapa.altura; y++) {
    for (let x = 0; x < mapa.largura; x++) {
      const tileX = x * TAMANHO_TILE;
      const tileY = y * TAMANHO_TILE;
      
      switch (mapa.tiles[y][x]) {
        case 0: // Terra
          fill(139, 69, 19);
          rect(tileX, tileY, TAMANHO_TILE, TAMANHO_TILE);
          break;
        case 1: // Grama
          fill(34, 139, 34);
          rect(tileX, tileY, TAMANHO_TILE, TAMANHO_TILE);
          break;
        case 2: // Caminho
          fill(210, 180, 140);
          rect(tileX, tileY, TAMANHO_TILE, TAMANHO_TILE);
          break;
        case 3: // Água (rio)
          fill(65, 105, 225);
          rect(tileX, tileY, TAMANHO_TILE, TAMANHO_TILE);
          break;
        case 4: // Ponte
          fill(139, 69, 19);
          rect(tileX, tileY, TAMANHO_TILE, TAMANHO_TILE);
          // Detalhes da ponte
          fill(100, 70, 40);
          rect(tileX, tileY + TAMANHO_TILE/2 - 2, TAMANHO_TILE, 4);
          rect(tileX + TAMANHO_TILE/4, tileY, 4, TAMANHO_TILE);
          rect(tileX + TAMANHO_TILE*3/4, tileY, 4, TAMANHO_TILE);
          break;
      }
    }
  }
  
  // Desenhar rio com detalhes
  for (let tile of mapa.rio) {
    const tileX = tile.x * TAMANHO_TILE;
    const tileY = tile.y * TAMANHO_TILE;
    
    // Onda no rio
    if (frameCount % 60 < 30) {
      fill(100, 149, 237);
    } else {
      fill(70, 130, 180);
    }
    rect(tileX, tileY, TAMANHO_TILE, TAMANHO_TILE);
  }
  
  // Desenhar árvores
  for (let arvore of mapa.arvores) {
    desenharArvore(arvore.x, arvore.y);
  }
  
  // Desenhar pedras
  for (let pedra of mapa.pedras) {
    desenharPedra(pedra.x, pedra.y);
  }
  
  // Desenhar construções
  desenharCasa(mapa.casa.x * TAMANHO_TILE, mapa.casa.y * TAMANHO_TILE, 
            mapa.casa.largura * TAMANHO_TILE, mapa.casa.altura * TAMANHO_TILE);
  
  desenharCentroReciclagem(mapa.centroReciclagem.x * TAMANHO_TILE, 
                     mapa.centroReciclagem.y * TAMANHO_TILE, 
                     mapa.centroReciclagem.largura * TAMANHO_TILE, 
                     mapa.centroReciclagem.altura * TAMANHO_TILE);
}

function desenharArvore(x, y) {
  fill(139, 69, 19); // Tronco
  rect(x - 5, y, 10, 20);
  fill(0, 100, 0); // Copa
  ellipse(x, y - 10, 25, 30);
}

function desenharPedra(x, y) {
  fill(100);
  beginShape();
  vertex(x - 10, y);
  vertex(x - 5, y - 10);
  vertex(x + 5, y - 8);
  vertex(x + 10, y);
  vertex(x + 5, y + 8);
  vertex(x - 5, y + 10);
  endShape(CLOSE);
}

function desenharCasa(x, y, w, h) {
  fill(150, 75, 0); // Parede
  rect(x, y, w, h);
  fill(100, 50, 0); // Telhado
  triangle(x, y, x + w, y, x + w/2, y - 20);
  fill(200, 200, 0); // Janela
  rect(x + 15, y + 15, 20, 20);
  fill(100); // Porta
  rect(x + w - 30, y + h - 40, 20, 40);
}

function desenharCentroReciclagem(x, y, w, h) {
  fill(70, 130, 180); // Edifício
  rect(x, y, w, h);
  fill(255); // Símbolo de reciclagem
  textSize(20);
  text("♻", x + w/2 - 8, y + h/2 + 8);
}

function gerarLixo(quantidade) {
  lixo = []; // Limpa todo o lixo antes de gerar novos
  
  for (let i = 0; i < quantidade; i++) {
    let x, y, posicaoValida;
    let tentativas = 0;
    
    do {
      posicaoValida = true;
      x = floor(random(1, mapa.largura - 1)) * TAMANHO_TILE + TAMANHO_TILE/2;
      y = floor(random(1, mapa.altura - 1)) * TAMANHO_TILE + TAMANHO_TILE/2;
      
      // Verificar colisão com construções
      if ((x >= mapa.casa.x * TAMANHO_TILE && x < (mapa.casa.x + mapa.casa.largura) * TAMANHO_TILE &&
          y >= mapa.casa.y * TAMANHO_TILE && y < (mapa.casa.y + mapa.casa.altura) * TAMANHO_TILE) ||
         (x >= mapa.centroReciclagem.x * TAMANHO_TILE && x < (mapa.centroReciclagem.x + mapa.centroReciclagem.largura) * TAMANHO_TILE &&
          y >= mapa.centroReciclagem.y * TAMANHO_TILE && y < (mapa.centroReciclagem.y + mapa.centroReciclagem.altura) * TAMANHO_TILE)) {
        posicaoValida = false;
      }
      
      // Verificar colisão com rio (mas pode estar na ponte)
      const tileX = floor(x/TAMANHO_TILE);
      const tileY = floor(y/TAMANHO_TILE);
      if (ehTileRio(tileX, tileY) && mapa.tiles[tileY][tileX] !== 4) {
        posicaoValida = false;
      }
      
      // Verificar colisão com árvores e pedras
      for (let arvore of mapa.arvores) {
        if (dist(x, y, arvore.x, arvore.y) < 25) {
          posicaoValida = false;
          break;
        }
      }
      
      for (let pedra of mapa.pedras) {
        if (dist(x, y, pedra.x, pedra.y) < 20) {
          posicaoValida = false;
          break;
        }
      }
      
      // Verificar colisão com outro lixo
      for (let t of lixo) {
        if (dist(x, y, t.x, t.y) < 20) {
          posicaoValida = false;
          break;
        }
      }
      
      tentativas++;
      if (tentativas > 100) break; // Prevenir loop infinito
    } while (!posicaoValida);
    
    if (posicaoValida) {
      lixo.push({
        x: x,
        y: y,
        tipo: floor(random(3)),
        coletado: false
      });
    }
  }
}

function atualizarJogo() {
  jogo.tempo += deltaTime / 1000;
  
  if (jogo.tempo > DURACAO_DIA) {
    proximoDia();
  }
  
  atualizarJogador();
  atualizarEnergia();
  verificarInteracoes();
}

function atualizarJogador() {
  elias.movendo = false;
  
  const velocidadeMovimento = elias.energia > 0 ? elias.velocidade : 1.2;
  
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
    elias.direcao = "cima";
    if (podeMover(0, -velocidadeMovimento)) {
      elias.y -= velocidadeMovimento;
      elias.movendo = true;
    }
  }
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
    elias.direcao = "baixo";
    if (podeMover(0, velocidadeMovimento)) {
      elias.y += velocidadeMovimento;
      elias.movendo = true;
    }
  }
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
    elias.direcao = "esquerda";
    if (podeMover(-velocidadeMovimento, 0)) {
      elias.x -= velocidadeMovimento;
      elias.movendo = true;
    }
  }
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
    elias.direcao = "direita";
    if (podeMover(velocidadeMovimento, 0)) {
      elias.x += velocidadeMovimento;
      elias.movendo = true;
    }
  }
  
  if (elias.movendo && frameCount % 6 === 0) {
    elias.frame = (elias.frame + 1) % 4;
  }
  
  elias.x = constrain(elias.x, 10, width - 10);
  elias.y = constrain(elias.y, 10, height - 10);
}

function podeMover(dx, dy) {
  const proximoX = elias.x + dx;
  const proximoY = elias.y + dy;
  
  // Verificar bordas
  if (proximoX < 0 || proximoX >= width || proximoY < 0 || proximoY >= height) {
    return false;
  }
  
  // Verificar construções
  if ((proximoX >= mapa.casa.x * TAMANHO_TILE && proximoX < (mapa.casa.x + mapa.casa.largura) * TAMANHO_TILE &&
      proximoY >= mapa.casa.y * TAMANHO_TILE && proximoY < (mapa.casa.y + mapa.casa.altura) * TAMANHO_TILE) ||
     (proximoX >= mapa.centroReciclagem.x * TAMANHO_TILE && proximoX < (mapa.centroReciclagem.x + mapa.centroReciclagem.largura) * TAMANHO_TILE &&
      proximoY >= mapa.centroReciclagem.y * TAMANHO_TILE && proximoY < (mapa.centroReciclagem.y + mapa.centroReciclagem.altura) * TAMANHO_TILE)) {
    return false;
  }
  
  // Verificar árvores e pedras
  for (let arvore of mapa.arvores) {
    if (dist(proximoX, proximoY, arvore.x, arvore.y) < 20) {
      return false;
    }
  }
  
  for (let pedra of mapa.pedras) {
    if (dist(proximoX, proximoY, pedra.x, pedra.y) < 15) {
      return false;
    }
  }
  
  // Verificar rio (só pode atravessar na ponte)
  const tileX = floor(proximoX / TAMANHO_TILE);
  const tileY = floor(proximoY / TAMANHO_TILE);
  if (ehTileRio(tileX, tileY) && mapa.tiles[tileY][tileX] !== 4) {
    return false;
  }
  
  return true;
}

function atualizarEnergia() {
  if (estaEmCasa()) {
    elias.energia = min(elias.maxEnergia, elias.energia + REGENERACAO_ENERGIA * (1 + elias.melhorias.casa.nivel * 0.3) * (deltaTime / 1000));
  } else if (elias.movendo) {
    elias.energia = max(0, elias.energia - GASTO_ENERGIA * (deltaTime / 1000));
  }
}

function estaEmCasa() {
  return (
    elias.x > mapa.casa.x * TAMANHO_TILE && 
    elias.x < (mapa.casa.x + mapa.casa.largura) * TAMANHO_TILE &&
    elias.y > mapa.casa.y * TAMANHO_TILE && 
    elias.y < (mapa.casa.y + mapa.casa.altura) * TAMANHO_TILE
  );
}

function verificarInteracoes() {
  // Coletar lixo (tecla E)
  if (keyIsDown(69) && elias.inventario.length < elias.maxInventario) {
    for (let t of lixo) {
      if (!t.coletado && dist(elias.x, elias.y, t.x, t.y) < 25) {
        t.coletado = true;
        elias.inventario.push(t.tipo);
        elias.energia = max(0, elias.energia - 3);
        break;
      }
    }
  }
  
  // Vender lixo (tecla V ou no centro)
  if ((keyIsDown(86) || 
      dist(elias.x, elias.y, 
           mapa.centroReciclagem.x * TAMANHO_TILE + TAMANHO_TILE, 
           mapa.centroReciclagem.y * TAMANHO_TILE + TAMANHO_TILE) < 40) && 
      elias.inventario.length > 0) {
    venderItens();
  }
  
  // Menu de melhorias (tecla U em casa)
  if (keyIsDown(85) && estaEmCasa()) {
    jogo.estado = ESTADOS_JOGO.LOJA;
  }
}

function venderItens() {
  let total = 0;
  
  for (let item of elias.inventario) {
    total += VALORES_LIXO[item] * (1 + elias.melhorias.ferramentas.nivel * 0.2);
  }
  
  elias.dinheiro += total;
  elias.inventario = [];
}

function proximoDia() {
  jogo.dia++;
  jogo.tempo = 0;
  elias.energia = elias.maxEnergia;
  
  // Limpar todo o lixo antes de gerar novos
  lixo = [];
  gerarLixo(15 + jogo.dia * 2);
}

function desenharUI() {
  // Painel de status
  fill(0, 0, 0, 150);
  rect(10, 10, 250, 130);
  fill(255);
  textSize(16);
  text(`Dia ${jogo.dia}`, 20, 30);
  text(`Lixo: ${elias.inventario.length}/${elias.maxInventario}`, 20, 50);
  text(`R$${elias.dinheiro.toFixed(2)}`, 20, 70);
  text(`Energia: ${floor(elias.energia)}/${elias.maxEnergia}`, 20, 90);
  text(`Tempo: ${floor(DURACAO_DIA - jogo.tempo)}s`, 20, 110);
  
  // Barra de energia
  const larguraEnergia = 180 * (elias.energia / elias.maxEnergia);
  fill(255, 0, 0);
  rect(20, 95, larguraEnergia, 5);
  
  // Controles
  textSize(12);
  fill(255);
  text("WASD: Mover | E: Coletar | V: Vender | U: Upgrade (em casa)", 10, height - 20);
  
  // Desenhar Elias
  desenharPersonagemElias();
  
  // Desenhar lixo
  for (let t of lixo) {
    if (!t.coletado) {
      fill(CORES_LIXO[t.tipo]);
      ellipse(t.x, t.y, 15, 15);
    }
  }
  
  // Indicador na casa
  if (estaEmCasa()) {
    fill(255, 255, 0);
    textSize(14);
    text("Pressione U para melhorias", width/2 - 100, 30);
  }
}

function desenharPersonagemElias() {
  push();
  translate(elias.x, elias.y);
  
  // Corpo (direção)
  fill(70, 50, 30);
  if (elias.direcao === "baixo") {
    rect(-10, -10, 20, 20);
    // Cabeça
    fill(210, 180, 140);
    ellipse(0, -15, 15, 15);
  } 
  else if (elias.direcao === "cima") {
    rect(-10, -10, 20, 20);
    // Cabeça
    fill(210, 180, 140);
    ellipse(0, -15, 15, 15);
  }
  else if (elias.direcao === "esquerda") {
    rect(-12, -10, 20, 20);
    // Cabeça
    fill(210, 180, 140);
    ellipse(-5, -15, 15, 15);
  }
  else if (elias.direcao === "direita") {
    rect(-8, -10, 20, 20);
    // Cabeça
    fill(210, 180, 140);
    ellipse(5, -15, 15, 15);
  }
  
  // Saco de lixo
  if (elias.inventario.length > 0) {
    fill(50);
    ellipse(10, 5, 15, 20);
  }
  
  // Pernas (animação)
  fill(40);
  if (elias.movendo) {
    let offsetPerna = sin(frameCount * 0.2) * 4;
    rect(-8, 10, 8, 10 + offsetPerna);
    rect(0, 10, 8, 10 - offsetPerna);
  } else {
    rect(-8, 10, 8, 10);
    rect(0, 10, 8, 10);
  }
  
  pop();
}

function desenharLoja() {
  // Fundo da loja
  fill(0, 0, 0, 200);
  rect(width/2 - 200, height/2 - 200, 400, 400);
  
  // Título
  fill(255);
  textSize(24);
  text("Loja de Melhorias", width/2 - 80, height/2 - 160);
  
  // Melhorias disponíveis
  const melhorias = [
    { nome: "Saco Maior", desc: "+5 slots de inventário", key: "saco", custo: elias.melhorias.saco.custo },
    { nome: "Ferramentas", desc: "+20% no valor de venda", key: "ferramentas", custo: elias.melhorias.ferramentas.custo },
    { nome: "Resistência", desc: "+20 energia máxima", key: "resistencia", custo: elias.melhorias.resistencia.custo },
    { nome: "Casa", desc: "+30% regeneração de energia", key: "casa", custo: elias.melhorias.casa.custo }
  ];
  
  // Desenhar melhorias
  for (let i = 0; i < melhorias.length; i++) {
    const y = height/2 - 120 + i * 80;
    const melhoria = melhorias[i];
    const possui = elias.melhorias[melhoria.key].nivel;
    
    // Fundo do item
    fill(50);
    rect(width/2 - 180, y, 360, 70);
    
    // Texto
    fill(255);
    textSize(18);
    text(`${melhoria.nome} (Nível ${possui})`, width/2 - 160, y + 25);
    textSize(14);
    text(melhoria.desc, width/2 - 160, y + 45);
    text(`R$${melhoria.custo}`, width/2 + 100, y + 35);
    
    // Botão de compra
    fill(elias.dinheiro >= melhoria.custo ? [0, 255, 0] : [100, 100, 100]);
    rect(width/2 + 120, y + 15, 60, 30);
    fill(0);
    textSize(12);
        text("Comprar", width/2 + 130, y + 35);
  }
  
  // Botão Voltar
  desenharBotao("Voltar", width/2 - 50, height/2 + 150, 100, 40);
}

function mousePressed() {
  if (jogo.estado === ESTADOS_JOGO.MENU) {
    // Verificar cliques no menu principal
    if (mouseX > width/2 - 80 && mouseX < width/2 + 80) {
      if (mouseY > height/2 - 50 && mouseY < height/2) {
        jogo.estado = ESTADOS_JOGO.JOGANDO; // Jogar
      } else if (mouseY > height/2 + 20 && mouseY < height/2 + 70) {
        jogo.estado = ESTADOS_JOGO.TUTORIAL; // Tutorial
      } else if (mouseY > height/2 + 90 && mouseY < height/2 + 140) {
        jogo.estado = ESTADOS_JOGO.CREDITOS; // Créditos
      }
    }
  } 
  else if (jogo.estado === ESTADOS_JOGO.LOJA) {
    // Verificar cliques na loja
    if (mouseX > width/2 - 50 && mouseX < width/2 + 50 &&
        mouseY > height/2 + 150 && mouseY < height/2 + 190) {
      jogo.estado = ESTADOS_JOGO.JOGANDO; // Voltar
    }
    
    // Verificar botões de compra
    const melhorias = ["saco", "ferramentas", "resistencia", "casa"];
    for (let i = 0; i < melhorias.length; i++) {
      const y = height/2 - 120 + i * 80;
      if (mouseX > width/2 + 120 && mouseX < width/2 + 180 &&
          mouseY > y + 15 && mouseY < y + 45) {
        const melhoria = melhorias[i];
        if (elias.dinheiro >= elias.melhorias[melhoria].custo) {
          elias.dinheiro -= elias.melhorias[melhoria].custo;
          elias.melhorias[melhoria].nivel++;
          
          // Aplicar efeitos das melhorias
          if (melhoria === "saco") {
            elias.maxInventario += 5;
            elias.melhorias.saco.custo = floor(elias.melhorias.saco.custo * 1.5);
          } else if (melhoria === "ferramentas") {
            elias.melhorias.ferramentas.custo = floor(elias.melhorias.ferramentas.custo * 1.5);
          } else if (melhoria === "resistencia") {
            elias.maxEnergia += 20;
            elias.melhorias.resistencia.custo = floor(elias.melhorias.resistencia.custo * 1.5);
          } else if (melhoria === "casa") {
            elias.melhorias.casa.custo = floor(elias.melhorias.casa.custo * 1.5);
          }
        }
      }
    }
  }
  else if (jogo.estado === ESTADOS_JOGO.TUTORIAL || jogo.estado === ESTADOS_JOGO.CREDITOS) {
    // Verificar botão Voltar nos outros estados
    if (mouseX > width/2 - 50 && mouseX < width/2 + 50 &&
        mouseY > height/2 + 100 && mouseY < height/2 + 140) {
      jogo.estado = ESTADOS_JOGO.MENU;
    }
  }
}

function keyPressed() {
  if (key === 'p' || key === 'P') {
    jogo.pausado = !jogo.pausado;
  }
  if (key === 'm' || key === 'M') {
    if (jogo.estado === ESTADOS_JOGO.JOGANDO) {
      jogo.estado = ESTADOS_JOGO.MENU;
    } else if (jogo.estado === ESTADOS_JOGO.MENU) {
      jogo.estado = ESTADOS_JOGO.JOGANDO;
    }
  }
}