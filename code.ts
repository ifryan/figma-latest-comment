figma.showUI(__html__)

interface comments {
  order_id: string;
}

// 展示评论数量
let num = 3;

// filekey辞典
const tree = {
  '{filename1}': '{filekey1}',
  '{filename2}': '{filekey2}',
}

const fileName = figma.root.name as keyof typeof tree;
console.log(tree[fileName]);

const fileUrl = "https://api.figma.com/v1/files/" + tree[fileName] + "/comments";
const headers = {
  // "method": "GET",
  "X-FIGMA-TOKEN": "{YOUR-FIGMA-TOKEN}",
}
async function getComment(fileUrl: string) {
  try {
    const response = await fetch(fileUrl, { headers })
    if (response.ok) {
      const json = await response.json();
      console.log(json, "\n");
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