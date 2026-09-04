
    /**
    * 激励广告回调
    */
    function RewardCallback(){
        //广告展示
        this.onAdShow = function(){};
        //广告点击
        this.onAdClick = function(){};
        //广告关闭
        this.onAdClose = function(){};
        //获取激励
        this.onReward = function(){};
        //广告加载失败
        this.onFailed = function(errorCode, errorMsg){};
    };


    /**
    * 奇汇广告SDK展示激励广告
    * RMMOD 2026-09-04: 奖励直发——原生广告通道（TorchRewardHelperImpl + Torch 聚合 SDK）已剥离，
    * 点击"看广告"不再加载广告，直接按看完广告的时序回调：onAdShow -> onReward -> onAdClose。
    * setTimeout(0) 让回调脱离当前调用栈，避免游戏事件解释器重入。
    */
    function showRewardAd(
        spaceId,
        callback
    ){
        window.TorchMapMapper.put(spaceId, callback);

        setTimeout(function(){
            var cb = window.TorchMapMapper.get(spaceId);
            if (cb == null) return;
            if (cb.onAdShow) cb.onAdShow();
            if (cb.onReward) cb.onReward();
            if (cb.onAdClose) cb.onAdClose();
        }, 0);
    };
