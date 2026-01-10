// 定数：Drive上のルートフォルダ名（作成したフォルダ名に合わせてください）
const ROOT_FOLDER_NAME = 'MyGachaApp';

function doGet() {
  return HtmlService.createTemplateFromFile('gacha').evaluate()
    .setTitle('お楽しみガチャ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * ガチャの設定とアイテムリストを取得するAPI
 * @param {string} gachaFolderName - 対象のガチャフォルダ名 (例: 'gacha1')
 */
function getGachaData(gachaFolderName = 'gacha1') {
  try {
    // フォルダ検索
    const folders = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
    if (!folders.hasNext()) throw new Error('Root folder not found');
    const root = folders.next();
    
    const targetFolders = root.getFoldersByName(gachaFolderName);
    if (!targetFolders.hasNext()) throw new Error('Gacha folder not found');
    const folder = targetFolders.next();

    // items.yaml の読み込み
    const files = folder.getFilesByName('items.yaml');
    if (!files.hasNext()) throw new Error('items.yaml not found');
    const yamlContent = files.next().getBlob().getDataAsString();

    return {
      success: true,
      yaml: yamlContent
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * 特定の画像と説明文(MD)を取得するAPI
 * フロントエンドでガチャ抽選後に呼び出されます
 */
function getItemAsset(gachaFolderName, imageName, mdName) {
  try {
    const folders = DriveApp.getFoldersByName(ROOT_FOLDER_NAME).next()
                      .getFoldersByName(gachaFolderName).next();
    
    // 画像をBase64データとして取得
    const imgFile = folders.getFilesByName(imageName).next();
    const imgBlob = imgFile.getBlob();
    const base64 = Utilities.base64Encode(imgBlob.getBytes());
    const mimeType = imgBlob.getContentType();

    // Markdownテキストを取得
    const mdFile = folders.getFilesByName(mdName).next();
    const mdContent = mdFile.getBlob().getDataAsString();

    return {
      success: true,
      imageData: `data:${mimeType};base64,${base64}`,
      mdContent: mdContent
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
