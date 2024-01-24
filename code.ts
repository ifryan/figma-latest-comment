figma.showUI(__html__)

interface comments {
  order_id: string;
}

// 展示评论数量
let num = 3;

// filekey辞典
const tree = {
  'WujieAI-2023/11': 'sVu5igAaD5FcQk0GfE3Mbi',
  '无界 AI v3.0': 'sK8qmvyY5bike5hVrZThTE',
  '🧭归档文件导航': 'gUPHLYpDZSf69YngFjskIP',
  '10_全局页面': 'sUzwCHbLnxLKXz5oGPQ7Qt',
  '11_首页': 'LjGND1oLRRaBWNE61n8vWT',
  '12_AI 创作': 'xLSMVYDWjv5caCcGrxtuFV',
  '13_广场': '0VphtgqhA2Ybb7BFFPhCyb',
  '14_词图': 'uDLHy5rtbM9sJloKYdoaT6',
  '15_我的': 'likkpV0WR5Twgj77YQUfI4',
  'WujieAI_H5_线上版本': 'zHLGLAd2fYHxo97k7PjDUX',
  '20_全局页面': 'nwmJLPoy5bKzTGdf5t0ftV',
  '21_首页': 'ZqBMUivMnBDGLInaz02pEo',
  '22_AI 创作': 'eDfRMJHVLcYe5PTwJoe1FC',
  '23_AI 大赛': 'poCjHXBwsO8OouJbanc31Z',
  '24_咒语生成器': 'EBeqB2EPr4WNsKnwj4h7To',
  '25_AI 实验室': 'cdW7CQOSNCvfl6AInUkAad',
  '26_AI 专业版': 'IFNKPBYv1REyiTKbEAEhZi',
  '27_企业服务': 'd0LtMsCPOALEYCnQaRvnfK',
  '28_商用图片': 'ITMZjSRBGTkeL4wE7YiIEd',
  'AI 学院': 'i8oK4IlJYsqoTwoJtidgHK',
  '广场': 'GUP0Xr11WWV10fSRNqNQxw',
  '开放模型': 'fZA1W3Zhf4MeoUaC5IGFnC',
  '无界化身H5': 'yZug4Z2d3BGLJlaok4dIzy',
  'WujieAI Design System': 'LxXa76mvbeoygs4KHyydAY',
  'WujieAI React Icon': 'bQ3lKO5tSmseJ87ttwyL05',
  '无界版图logo': 'C2fPk9tMTracjY8k6AJ34W',
  '3DMADE': '9MyX1J78rMVTSWcAoinonq',
  'WujieAI 名片': 'pqel1vwMxvKcivoH5RVrAI',
  '文创商城电商运营内容': 'aZRlqAMrK2aIl5gV0OuvoD',
  '无界 AI v3.0-全量存档-20231001': 'ed2lvV5AuMBvbEOurEIKAY',
  '无界版图 v1 设计稿汇总': 'Tv69SIOsiouRIcc1MruQlJ',
  '无界版图 临时文件': 'mptsX22eZFC3l3lhFL1D15',
  '无界版图运营需求': 'c4bC8ZYRZ1qHh3OApDAVdM',
  '版权': 'Vmbdx9a6b3iuNLJeQM1prv',
  '白小苏': '4MyLR2qFLdkt1EnUcajQZm'
}

const fileName = figma.root.name as keyof typeof tree;
console.log(tree[fileName]);

const fileUrl = "https://api.figma.com/v1/files/" + tree[fileName] + "/comments";
const headers = {
  // "method": "GET",
  "X-FIGMA-TOKEN": "figd_7xLLNbtyoZRciGhBF3EUlUVetYNANRgmH47yzqsg",
}
async function getComment(fileUrl: string) {
  try {
    const response = await fetch(fileUrl, { headers })
    if (response.ok) {
      const json = await response.json();
      // console.log(json, "\n");
      let sortedJson = json.comments.slice().sort((a: comments, b: comments) => parseInt(b.order_id) - parseInt(a.order_id));
      console.log(sortedJson);
      const text = [];
      for (let i = 0; i < num; i++) {
        // 达到约定数量或者展示全部条数
        if (i >= sortedJson.length) {
          figma.ui.postMessage(text);
          console.log(text);
          break;
        }
        // 判断是否为子评论
        if (sortedJson[i].client_meta !== null) {
          const commentLink = "https://www.figma.com/file/" + tree[fileName] + "?node-id=" + sortedJson[i].client_meta.node_id + "#" + sortedJson[i].id;
          text.push(`#${sortedJson[i].order_id} ${sortedJson[i].message}</br>${commentLink}`)
        }
      }
      // 传递参数
      figma.ui.postMessage(text);
      console.log(text);

    } else {
      throw new Error("response.status");
    }
  } catch (error) {
    console.log(error);

  }
}
getComment(fileUrl);

