var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
let tree = {};
const team_id = ["1128603199120173633",];
const headers = { 'X-FIGMA-TOKEN': 'figd_CkpNatwsdOufiNRQbeZU5CMih-ksKKciVn1yQX37', };
const fetchProjectData = (list = []) => __awaiter(void 0, void 0, void 0, function* () {
    const p = [];
    for (const element of list) {
        const teamUrl = `https://api.figma.com/v1/teams/${element}/projects`;
        const response = yield axios.get(teamUrl, { headers });
        p.push(...response.data.projects.map((item) => {
            return item.id;
        }));
    }
    return p;
});
const fetchProjectFileData = (list = [], keyOrName) => __awaiter(void 0, void 0, void 0, function* () {
    const p = [];
    for (const element of list) {
        const fileUrl = `https://api.figma.com/v1/projects/${element}/files`;
        const response = yield axios.get(fileUrl, { headers });
        p.push(...response.data.files.map((item) => {
            return item[keyOrName];
        }));
        // console.log('fileResponse', p);
    }
    return p;
});
// 使用.then
// function createTree(ProjectFileKey: Promise<string[]>, ProjectFileName: Promise<string[]>) {
//     ProjectFileKey
//         .then(res => {
//             Promise.all(res.map((item, index) => {
//                 ProjectFileName.then(fileName => {
//                     tree[item] = fileName[index]
//                 })
//             }))
//         }).then(() => {
//             // console.log(tree);
//             return tree
//         })
// }
// 使用await
function createTree(ProjectFileKey, ProjectFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileKey = yield ProjectFileKey;
        const fileName = yield ProjectFileName;
        fileName.forEach((item, index) => {
            tree[item] = fileKey[index];
        });
        console.log(tree);
        return tree;
    });
}
// 使用.then
fetchProjectData(team_id).then(res => {
    const ProjectFileKey = fetchProjectFileData(res, "key").then(res => {
        // console.log('这是 fileKey', `共有${res.length}个文件`, res)
        return res;
    });
    const ProjectFileName = fetchProjectFileData(res, "name").then(res => {
        // console.log('这是 filename', `共有${res.length}个文件`, res)
        return res;
    });
    createTree(ProjectFileKey, ProjectFileName);
});
// 使用await
// (async () => {
//     const res = await fetchProjectData(team_id);
//     const ProjectFileKey = fetchProjectFileData(res, "key").then(res => res);
//     const ProjectFileName = fetchProjectFileData(res, "name").then(res => res);
//     await createTree(ProjectFileKey, ProjectFileName);
//     // 现在可以随时使用全局变量 tree 了
// })();
