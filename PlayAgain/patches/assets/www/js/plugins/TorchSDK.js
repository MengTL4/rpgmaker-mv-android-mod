
    /**
    * 奇汇自定义map
    * RMMOD 2026-09-04: 广告 SDK 已剥离。TorchMap/JsonString 保留（TorchRewardAd.js 仍在用），
    * TorchSDKInit 改为空操作，不再经 alert() 向原生层发 TORCH_Type=init。
    */
    function TorchMap() {

        var arr = new Array();

	    var struct = function(key, value) {
	    	this.key = key;
		    this.value = value;
	    }

	    this.put = function(key, value){
		    for (var i = 0; i < arr.length; i++) {
			    if ( arr[i].key === key ) {
				    arr[i].value = value;
				    return;
			    }
		    }
	    	arr[arr.length] = new struct(key, value);
	    }

	    this.get = function(key) {
		    for (var i = 0; i < arr.length; i++) {
			    if (arr[i].key === key ) {
				    return arr[i].value;
			    }
		    }
		    return null;
	    }
    };

    /**
    * 奇汇 json 转换
    */
    function JsonString(){

        var content = '';

        this.add = function(key,value) {
            if(content != ''){
                content = content + ",";
            };
            content = content + "\"" + key + "\":\"" + value + "\"";
        };

        this.toString = function() {
            content = "{" + content + "}";
            return content;
        };
    };


    (function(){
        window.TorchMapMapper = new TorchMap();
        window.TorchSDKIsInit = false;
    })();

    /**
    * 奇汇广告SDK初始化方法（已置空：原生 TorchSDKHelperImpl 随广告 SDK 一并剥离）
    */
    function TorchSDKInit(
        appKey,
        isDebugModel = false,
        isTestModel = false
    ){
        window.TorchSDKIsInit = true;
    }





    function nativeToJs(spaceId, method, errorCode, errorMsg){
        var callback = window.TorchMapMapper.get(spaceId);
        if(callback == null){
            return;
        };
        if (method == "onAdShow"){
            callback.onAdShow();
        }else if (method == "onAdClick"){
            callback.onAdClick();
        }else if (method == "onAdClose"){
            callback.onAdClose();
        }else if (method == "onReward"){
            callback.onReward();
        }else if (method == "onFailed"){
            callback.onFailed(errorCode, errorMsg);
        }
    }
