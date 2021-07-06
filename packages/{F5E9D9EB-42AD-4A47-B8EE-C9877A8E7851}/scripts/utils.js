let my_utils = {}

my_utils.scriptInfo = window.ScriptInfo;
my_utils.packagePath = utils.GetPackagePath(my_utils.scriptInfo.PackageId);

my_utils.getAsset = assetFile => utils.ReadTextFile(`${my_utils.packagePath}/assets/${assetFile}`);
my_utils.getImageAsset = assetFile => gdi.Image(`${my_utils.packagePath}/assets/images/${assetFile}`);
my_utils.getImagesPath = `${my_utils.packagePath}/assets/images/`;
my_utils.getScriptPath = `${my_utils.packagePath}/scripts/`;