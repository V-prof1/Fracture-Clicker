# Fracture Clicker

Clicker offline-first feito em HTML/CSS/JavaScript, pensado para funcionar no navegador em PC/celular e depois ser empacotado como APK sem reescrever o jogo.

## Beta 0.1

- Click manual com streak, críticos, efeitos e 10 estilos de som sintetizados
- Auto Click separado do Click Power
- Upgrades de nível aberto com custos exponenciais
- Rebirths, Fragments e árvore permanente
- Núcleo evolui visualmente em marcos de Rebirth
- 10 mutações normais + 1 secreta
- Missões rápidas e conquistas
- Overcharge, Rebirth Rush e Fracture Events
- Códigos de uso único por save e buffs temporários
- Produção offline com limite melhorável
- Save local automático
- Painel de desenvolvimento local protegido por múltiplas condições
- Teto de Money: 1 Centillion (10^303)

## Estrutura

```text
index.html
styles.css
manifest.webmanifest
sw.js
js/
  game.js
  data.js
  audio.js
  security.js
  runtime/segments.js
```

## Teste local

Sirva a pasta por HTTP (GitHub Pages, servidor local ou outro host estático). Módulos ES não devem ser testados abrindo `index.html` diretamente como `file://`.

## GitHub Pages

O projeto é 100% estático e pode ser publicado diretamente pelo GitHub Pages. O service worker mantém os arquivos principais em cache para uso offline depois da primeira visita.

## Segurança offline

Códigos e flags locais são fragmentados/ofuscados para evitar descoberta casual. Como toda a lógica roda no dispositivo, nenhuma proteção client-side é impossível de contornar por engenharia reversa. Uma futura edição online deverá validar perks e leaderboards no servidor.
