
figma.showUI(__html__, { themeColors: false, width: 400, height: 300 })


let uiConfig: {
  token: string;
  team_id: string;
  tree: { [key: string]: any };
  comments: string[];
  [key: string]: string | object; // 添加一个索引签名，允许额外的属性
} = {
  token: '',
  team_id: '',
  tree: {},
  comments: []
}



// 展示评论数量
let num = 10;

// 设置本地储存函数
function setLocalData(key: string, data: any) {
  figma.clientStorage.setAsync(key, data)
}

// 读取本地储存函数
async function getDataFromClientStorage(key: string): Promise<any> {
  try {
    // 从客户端存储获取数据
    const storedData = await figma.clientStorage.getAsync(key);

    // 如果存在数据，则将其解析为原始对象
    if (storedData) {
      return storedData;
    } else {
      console.log('No data found for the given key');
      return null;
    }
  } catch (err) {
    console.error('Error retrieving data:', err);
    return null;
  }
}


async function getTreeFromTeamID(team_id: string, token: string) {
  const headers = { 'X-FIGMA-TOKEN': token }
  // 读取team内项目, 存入到 teamIdPromiseList:[]
  const url = `https://api.figma.com/v1/teams/${team_id}/projects`
  //.json()返回的是一个 promise
  const projectsList: [{ id: string, name: string }] = (await (await fetch(url, { headers })).json()).projects;
  console.log('projectsList:', projectsList);

  const filelist = projectsList.map(async element => {
    const url = `https://api.figma.com/v1/projects/${element.id}/files`
    return (await fetch(url, { headers })).json()
  })
  const res = await Promise.all(filelist)
  console.log('filelist:', res)

  //更新 uiconfig 和 本地缓存
  uiConfig.token = token
  setLocalData('token', uiConfig.token)

  uiConfig.team_id = team_id
  setLocalData('team_id', uiConfig.team_id)

  uiConfig.tree = {}
  res.forEach(element => {
    element.files.forEach((i: { key: string, name: string }) => {
      uiConfig.tree[i.name] = i.key
    })
  });
  setLocalData('tree', uiConfig.tree)

  // console.log('uiConfig', uiConfig);

}

// 读取文件内评论
async function getComment(fileID: string) {
  try {
    const fileUrl = `https://api.figma.com/v1/files/${fileID}/comments`
    const headers = { 'X-FIGMA-TOKEN': uiConfig.token }
    const response = await fetch(fileUrl, { headers })
    if (response.ok) {
      const json = await response.json();
      // console.log(json, "\n");
      let sortedJson = json.comments.slice().sort((a: { order_id: string; }, b: { order_id: string; }) => parseInt(b.order_id) - parseInt(a.order_id));
      // console.log('sortedJson', sortedJson);
      uiConfig.comments = []
      for (let i = 0; i < num - 1; i++) {
        // 达到约定数量或者展示全部条数 //修改判断逻辑
        if (i === sortedJson.length) {
          // console.log('getComment:', uiConfig.comments);
          break;
        }
        // 判断是否为子评论
        if (sortedJson[i].client_meta !== null) {
          const commentLink = "https://www.figma.com/file/" + fileID + "?node-id=" + sortedJson[i].client_meta.node_id + "#" + sortedJson[i].id;
          uiConfig.comments.push(`#${sortedJson[i].order_id} ${sortedJson[i].message}</br>👉🏻 ${commentLink}`)
        }
      }
    } else {
      throw new Error("response.status");
    }
  } catch (error) {
    console.log(error);
  }
}

// 首次进入读取数据
const uiconfigIndex = ['token', 'team_id', 'tree']
const promiseList = uiconfigIndex.map(async i => {
  const res = await getDataFromClientStorage(i)
  if (res) {
    console.log(`${i}:`, res);
    uiConfig[i] = res
  }
});
Promise.all(promiseList).then(async () => {
  if (Object.keys(uiConfig.tree).length === 0) {
    figma.ui.postMessage({ uiConfig });
  } else {
    // 获取当前打开插件的figma文件名
    const fileName = figma.root.name as keyof typeof uiConfig.tree;
    if (uiConfig.tree[fileName]) {
      await getComment(uiConfig.tree[fileName])
      figma.ui.postMessage({ uiConfig });
    } else {
      figma.notify('当前文件不在您设置的 team 中')
      figma.ui.postMessage({ uiConfig });
    }
  }
})


// 接受提交的数据
figma.ui.onmessage = async (message) => {
  console.log("got this from the UI", message)
  uiConfig.team_id = message.team_id
  uiConfig.token = message.token
  await getTreeFromTeamID(uiConfig.team_id, uiConfig.token);
  const fileName = figma.root.name as keyof typeof uiConfig.tree;
  if (uiConfig.tree[fileName]) {
    await getComment(uiConfig.tree[fileName])
    figma.ui.postMessage({ uiConfig });
  } else {
    figma.notify('当前文件不在您设置的 team 中')
    figma.ui.postMessage({ uiConfig });
  }
}