var reportInfoGrid;
var reportInfoStore;
var reportHeaderStore;
var mainColumns = [];//表格头
var checkNodes = [];//勾选的树节点
var colNo = [];
var LIMIT = 15;
var dimNum = 0;//当前维度个数
var lineDimId;
var fields = [];//表格fields
var DEBUGID = "1";
var DATADT = "20170630";//查询表格信息数据日期
//点击‘+’响应事件
function popClick(){
	var i=1;
	popTree.getRootNode().reload();
	document.onclick=function(event){ 
		if(i==1){
			var e=event||window.event;  
			popWindow.x=e.clientX-140;
			popWindow.y=e.clientY+19;
		    popWindow.show();
		    i++;
		}
	}
}
//表头列点击响应事件
function lineClick(id){
	lineDimId = id;
	var i=1;
	if(id == 'DATA_DT'){
		document.onclick=function(event){ 
			if(i==1){
				i++;
				var e=event||window.event;  
				dateWindow.x=e.clientX;
				dateWindow.y=e.clientY;
			    dateWindow.show();
			    Ext.getCmp('lineDate').onTriggerClick();
			    LovCombo.expand();
				LovCombo.disable();
			}
		}
	}else{
		document.onclick=function(event){ 
			if(i==1){
				var e=event||window.event;  
				indiWindow.x=e.clientX;
				indiWindow.y=e.clientY;
			    indiWindow.show();
				setInvisible('value');
				setInvisible('value1');
				setInvisible('value2');
				setInvisible('fenge');
			    i++;
			}
		}
		/*lineStore.load({
			params	: {
				paramType : id,
				level : 0
			}
		});
		document.onclick=function(event){ 
			if(i!=1){
				LovCombo.expand();
			}
			if(i==1){
				var e=event||window.event;  
				sortWindow.x=e.clientX;
				sortWindow.y=e.clientY;
				LovCombo.show();
				LovCombo.setValue('');
			    sortWindow.show();
				LovCombo.onTriggerClick();
				LovCombo.expand();
				LovCombo.disable();
			    i++;
			}
		}*/
	}
}
function delCol(id){
	alert(id)
}
//查询所有勾选树节点
function getCheckNode(node){
	if(node.attributes.checked){
		checkNodes.push(node)
	}
	if(!node.isLeaf()){//目录节点
		for (var i = 0; i < node.childNodes.length; i++) {
			getCheckNode(node.childNodes[i]);
		}
	}
}
//获取表头并加载表数据信息
function getRptHeaderInfo(){
	dimNum = 0;
	fields = [];
	Ext.each(reportHeaderStore,function(item){
		for(var i =0;i<reportHeaderStore.getCount();i++){
			var indiId = reportHeaderStore.getAt(i).data.indiId;
			fields.push({name : reportHeaderStore.getAt(i).data.indiId});
			console.info(reportHeaderStore.getAt(i).data);
			if(reportHeaderStore.getAt(i).data.date=='dim'){
				dimNum++;
				//if(indiId!='DATA_DT'){
					/*mainColumns.push(
						{header: reportHeaderStore.getAt(i).data.aliasName+"<img class='line' id='"+indiId+"' src='../../images/icon/line.png' alt='三' onclick='lineClick(this.id)'></img>",dataIndex:indiId,sortable:true,width:150}
					);*/
				//}else{
					mainColumns.push(
						{header: reportHeaderStore.getAt(i).data.aliasName+"<img class='line' id='"+indiId+"' src='../../images/icon/line.png' alt='三' onclick='lineClick(this.id)'></img>",dataIndex:indiId,sortable:true,width:120}
					);
				//}
			}else{
				mainColumns.push(
					{header: "<span id='"+indiId+"' onclick='delCol(this.id)'>-&nbsp;&nbsp;</span>"+reportHeaderStore.getAt(i).data.aliasName+"<img class='line' id='"+indiId+"' src='../../images/icon/line.png' alt='三' onclick='lineClick(this.id)'></img>",dataIndex:indiId,sortable:true,width:200}
				);
			}
		}
	});
	reportInfoStore = new Ext.data.JsonStore({
		url				: globalConstant.contentPath + '/rptManuAction_doGetRptInfo.action',
		root			: "data",
		totalProperty	: "rowCount",
		remoteSort		: true,
		fields			: fields
	});
	mainColumns.push({header : '<div onclick="popClick()"><center>+</center><div>', dataIndex:"",width:260, rowspan:50});
	reportInfoStore.load({
		params	: {
			start   : 0,
			limit   : LIMIT,
			rptId   : RPTID,
			inDebugID: DEBUGID,
			dataDate : DATADT
		}
	});
}
//列动态变化时保存显示列信息
function saveRpt(node){
	var data = [];
	for(var i=0;i<node.length;i++){
		data.push(node[i].id+'-'+node[i].text);
	}
	Ext.Ajax.request({
		url 	: globalConstant.contentPath + '/rptManuAction_doSaveRpt.action',
		params 	: {
			rptId   : RPTID,
			data	: Ext.encode(data),
			dimNum  : dimNum
		},
		method 	: 'POST',
		success : function(response) {
			mainColumns = [];
			mainColumns.push(new Ext.grid.RowNumberer());
			reportHeaderStore.load({
				params	: {
					limit	: LIMIT,
					start	: 0,
					rptId   : RPTID
				},
				callback : function(){
					getRptHeaderInfo();
					reportInfoGrid.reconfigure(reportInfoStore,new Ext.grid.ColumnModel(mainColumns));
				}
			})
		},
		scope 	: this
	});
}

var linkStore = new Ext.data.SimpleStore({
	fields		: ['desc','code'],
	data		: [
		['等于', '='],
		['大于', '>'],
		['小于', '<'],
		['大于等于', '>='],
		['小于等于', '<='],
		['介于', 'in']
	]
});
//表头点击控件store
var lineStore = new Ext.data.JsonStore({
	url : globalConstant.contentPath + '/compileReportAction_dofindParamsValues.action',
	root : "data",
	totalProperty : "rowCount",
	remoteSort : true,
	fields : ['code', 'desc']
})
lineStore.load({
	params	: {
		paramType : id,
		level : 0
	}
});

reportHeaderStore = new Ext.data.JsonStore({
	url				: globalConstant.contentPath + '/rptManuAction_doGetRptHeaderInfo.action',
	root			: "data",
	totalProperty	: "rowCount",
	remoteSort		: true,
	fields		:  [
		{name: 'rptId',		mapping: 'rptId'},
		{name: 'rptName',	mapping: 'rptName'},
		{name: 'colName',	mapping: 'colName'},
		{name: 'colType',	mapping:'colType'},
		{name: 'rptIdd',	mapping: 'rptIdd'},
		{name: 'debugFlag', mapping: 'debugFlag'},
		{name: 'colNo',		mapping: 'colNo'},
		{name: 'aliasName',	mapping: 'aliasName'},
		{name: 'indiId',	mapping: 'indiId'},
		{name: 'date',		mapping: 'date'}
	]
});
reportHeaderStore.load({
	params	: {
		rptId   : RPTID
	}
});
//表头点击下拉框
var LovCombo = new Ext.ux.form.LovCombo({
    renderTo		: Ext.getBody(),
    store			: lineStore,
    mode			: "local",
    displayField	: "desc",
    valueField		: "code",
    hiddenName		: "ces",
    name			: "ces",
    triggerAction	: "all",
    id				: "lovCombo",
    style  		    : 'background-color:#F7F7F7;border-color:#F7F7F7;',
    hideTrigger     : true,
    width			: 150,
    autoSelect 		: true,
    lazyInit		: true,
    showSelectAll	: true,
    resizable 		: true,
    hidden			: true
});
var linePanel = new Ext.Panel({
	bodyStyle	: 'background-color:#F7F7F7;',
	border  : false,
	width 	: 150,
	height 	: 70,
	layout	: {
		type: 'column'
	},
	items		: [{
		xtype	: 'button',
		text	: '确定',
		style	: 'margin-left:70px;margin-top:10px;',
		width	: 70,
		plugins	: [
			new Ext.ux.button.StylePlugin({
				theme		: 'query'
			})
		],
		handler	: function(){
			condPanel.removeAll();
			var colValue;
			var col;
			for(var i=0;i<colNo.length;i++){
				if(lineDimId==colNo[i].split('-')[0]){
					colValue = Ext.getCmp('lovCombo').getValue();
					col = colNo[i].split('-')[1]
				}
			}
			reportInfoStore.reload({
				params : {
					start   : 0,
					limit   : LIMIT,
					rptId   : RPTID,
					inDebugID: DEBUGID,
					dataDate : DATADT,
					col	: col,
					colValue : colValue
				}
			});
			sortWindow.hide();
		}
	},LovCombo]
});
//表头点击弹窗
var sortWindow = new Ext.Window({
	bodyStyle	    : 'background-color:#FFF;',
	style			: 'border-radius:5px;',
	frame 			: false,
	border			: false,
	id				: 'sortWindow',
	width 			: 150,
	height 			: 70,
	closeAction 	: 'hide',
	resizable 		: false,
	draggable		: false,
	layout			: 'fit',
	closable		: false,
	items 			: [linePanel]
})

var datePanel = new Ext.Panel({
	bodyStyle	: 'background-color:#F7F7F7;',
	border  : false,
	width 	: 150,
	height 	: 70,
	layout	: {
		type: 'column'
	},
	items		: [{
		xtype	: 'button',
		text	: '确定',
		style	: 'margin-left:70px;margin-top:10px;',
		width	: 70,
		plugins	: [
			new Ext.ux.button.StylePlugin({
				theme		: 'query'
			})
		],
		handler	: function(){
			var colValue;
			var col;
			for(var i=0;i<colNo.length;i++){
				if(lineDimId==colNo[i].split('-')[0]){
					colValue = Ext.getCmp('lovCombo').getValue();
					col = colNo[i].split('-')[1]
				}
			}
			reportInfoStore.reload({
				params : {
					start   : 0,
					limit   : LIMIT,
					rptId   : RPTID,
					inDebugID: DEBUGID,
					dataDate : DATADT,
					col	: col,
					colValue : colValue
				}
			});
			dateWindow.hide();
		}
	},{
		xtype   : 'label',
		style	: 'padding-top:50px;'
	},{
		xtype	: 'datefield',
		id 		: 'lineDate',
		name 	: 'lineDate',
		width 	: 150,
		format	: 'Ymd',
		editable	: true
	}]
});
//表头点击弹窗
var dateWindow = new Ext.Window({
	bodyStyle	    : 'background-color:#FFF;',
	style			: 'border-radius:5px;',
	frame 			: false,
	border			: false,
	id				: 'dateWindow',
	width 			: 150,
	height 			: 70,
	closeAction 	: 'hide',
	resizable 		: false,
	draggable		: false,
	layout			: 'fit',
	closable		: false,
	items 			: [datePanel]
})

var indiPanel = new Ext.Panel({
	bodyStyle	: 'background-color:#F7F7F7;',
	border  : false,
	width 	: 180,
	height 	: 140,
	layout	: {
		type: 'column'
	},
	items		: [{
		xtype	: 'button',
		text	: '确定',
		style	: 'margin-left:70px;margin-top:10px;',
		width	: 70,
		plugins	: [
			new Ext.ux.button.StylePlugin({
				theme		: 'query'
			})
		],
		handler	: function(){
			var colValue;
			var col;
			for(var i=0;i<colNo.length;i++){
				if(lineDimId==colNo[i].split('-')[0]){
					colValue = Ext.getCmp('lovCombo').getValue();
					col = colNo[i].split('-')[1]
				}
			}
			reportInfoStore.reload({
				params : {
					start   : 0,
					limit   : LIMIT,
					rptId   : RPTID,
					inDebugID: DEBUGID,
					dataDate : DATADT,
					col	: col,
					colValue : colValue
				}
			});
			indiWindow.hide();
		}
	},{
		xtype   : 'label',
		style	: 'padding-top:50px;',
		width	: 20
	},{
		xtype		: 'combo',
		name		: 'indiCombo',
		id			: 'indiCombo',
		width		: 120,
		store		: linkStore,
		emptyText	: '请选择',
		displayField: 'desc',
		valueField 	: 'code',
		forceSelection : true,
		triggerAction : 'all',
		mode		: 'local',
		editable 	: false,
		listeners	: {
			select	: function(){
				if(Ext.getCmp('indiCombo').getValue()==6){
					setInvisible('value');
					setVisible('value1')
					setVisible('fenge');
					setVisible('value2');
				}else{
					setVisible('value');
					setInvisible('value1');
					setInvisible('fenge');
					setInvisible('value2');
				}
			}
		}
	},{
		xtype   : 'label',
		style	: 'padding-top:40px;'
	},{
		xtype	: 'textfield',
		id		: 'value',
		name	: 'value',
		width   : 120
	},{
		xtype	: 'textfield',
		id		: 'value1',
		name	: 'value1',
		width   : 70
	},{
		xtype   : 'label',
		id		: 'fenge',
		text    : '-',
		style   : 'padding-left:5px;'
	},{
		xtype	: 'textfield',
		id		: 'value2',
		name	: 'value2',
		width   : 70,
		style   : 'margin-left:5px;'
	}]
});
//表头点击弹窗
var indiWindow = new Ext.Window({
	bodyStyle	    : 'background-color:#FFF;',
	style			: 'border-radius:5px;',
	frame 			: false,
	border			: false,
	id				: 'indiWindow',
	width 			: 180,
	height 			: 140,
	closeAction 	: 'hide',
	resizable 		: false,
	draggable		: false,
	layout			: 'fit',
	closable		: false,
	items 			: [indiPanel]
})
//粒度树
var popTree = new Ext.tree.TreePanel({
	bodyStyle	: 'background-color:#F8F8F8;',
	border  : false,
	id 		: 'popTree',
	height 	: 200,
	width 	: 250,
	rootVisible : false,
	lines 	: true,
	autoScroll : true,
	root 	: new Ext.tree.AsyncTreeNode({
		expanded: true,
		leaf 	: false,
		iconCls : 'folder'
	}),
	listeners 		: {
		
	},
	loader : new Ext.tree.TreeLoader({
		dataUrl : globalConstant.contentPath + "/rptManuAction_doGetTreeByStati.action",
		listeners	: {
			beforeload	: function(treeLoader, node) {
				this.baseParams.level = LEVEL;
			},
			load        : function(){
				popTree.expandAll();
			}
		},
		baseAttrs : { 
			uiProvider : Ext.ux.TreeCheckNodeUI 
		}
	})
});
var queryPanel = new Ext.Panel({
	bodyStyle	: 'background-color:#F8F8F8;',
	region      : 'north',
	border  : false,
	width 	: 260,
	height 	: 60,
	layout: {
		type: 'hbox',
	 	align: 'middle'
	},
	items		: [{
		xtype	: 'button',
		text	: '确定',
		style	: 'margin-left:40px;',
		width	: 70,
		plugins	: [
			new Ext.ux.button.StylePlugin({
				theme		: 'query'
			})
		],
		handler	: function(){
			checkNodes = [];
			getCheckNode(popTree.getRootNode());
			popWindow.hide();
			saveRpt(checkNodes);
		}
	},{
		xtype		: 'button',
		text		: '取消',
		width		: 70,
		style		: 'margin-left:90px;',
		theme		: 'reset',
		handler		: function(){
			popWindow.hide();
		}
	}]
});
var popPanel = new Ext.Panel({
	bodyStyle	: 'background-color:#F8F8F8;',
	region      : 'center',
	style		: 'padding-top:5px;',
	border  : false,
	width 	: 260,
	height 	: 70,
	layout	: 'fit',
	items	: [popTree]
});
var popWindow = new Ext.Window({
	bodyStyle	    : 'background-color:#F8F8F8;',
	style			: 'border-radius:5px;',
	animateTarget 	: Ext.getBody(),
	frame 			: false,
	id				: 'popWindow',
	width 			: 260,
	height 			: 380,
	closeAction 	: 'hide',
	resizable 		: false,
	draggable		: false,
	layout			: 'border',
	closable		: false,
	items 			: [queryPanel,popPanel]
});
var condPanel = new Ext.Panel({
	style	: 'background:#FFF;',
	id 		: 'condPanel',
	region	: 'center',
	layout: {
		type	: 'hbox',
		align	: 'middle'
	},
	height	: 70,
	bodyStyle: 'border:none;border-bottom:1px solid #E9E9E9;'
});
Ext.onReady(function() {
	Ext.Ajax.timeout = 600000;
	Ext.QuickTips.init();
	Ext.form.Field.prototype.msgTarget = 'qtip';

	Ext.util.Observable.observeClass(Ext.data.Connection);
	Ext.data.Connection.on('requestcomplete', function(conn, resp, options) {
		if (resp && resp.getResponseHeader && resp.getResponseHeader('__timeout'))
			window.location.href = globalConstant.noLoginPage;
	});
	Ext.data.Connection.on('requestexception', function(conn, resp, options) {
		if (resp.status == 0)
			parent.Ext.Msg.alert('系统消息', '数据请求出错，应用服务器已关闭，请您联系系统管理员！');
	});
	/***********************************************公共参数******************************************/
	var clientWidth = document.body.clientWidth - 15;
	var clientHeight = document.body.clientHeight;
    var cmd = Primb.getAddCmd();
	/***********************************************函数区域******************************************/
	function generateGrid(){
		mainColumns.push(new Ext.grid.RowNumberer());
		reportHeaderStore.load({
			params	: {
				rptId   : RPTID
			},
			callback : function(){
				for(var i=0;i<reportHeaderStore.getCount();i++){
					if(reportHeaderStore.getAt(i).data.date=='dim'){
						var id = reportHeaderStore.getAt(i).data.indiId;
						var num = reportHeaderStore.getAt(i).data.colNo;
						colNo.push(id+'-'+num)
					}
				}
				getRptHeaderInfo();
				columnModel = new Ext.grid.ColumnModel(mainColumns);
				createGrid();
			}
		})  
	}
	function search(){
		var item = condPanel.items.items
		var condData = [];
		for(var i=0;i<item.length;i=i+3){
			var col;
			var colValue;
			for(var j=0;j<colNo.length;j++){
				var id = colNo[j].split('-')[0]+'_drag_field';
				var num = colNo[j].split('-')[1];
				if(id == item[i+1].id){
					col = num; 
				}
			}
			if(item[i+1].xtype=='datefield'){
				colValue = Ext.getCmp(item[i+1].id).getRawValue();
			}else{
				colValue = Ext.getCmp(item[i+1].id).getValue();
			}
			condData.push(col+"-"+colValue)
		}
		reportInfoStore.reload({
			params : {
				start   : 0,
				limit   : LIMIT,
				rptId   : RPTID,
				inDebugID: DEBUGID,
				dataDate : DATADT,
				data	: Ext.encode(condData)
			}
		});
	}
	function　createGrid(){
		reportInfoGrid = Ext.create({
			xtype			: 'primb.grid',
			region			: 'center',
			id				: 'reportGrid',
			viewConfig	: {
				forceFit : false
			},	
			store			: reportInfoStore,
			cm				: columnModel,
			tbuttons		: [{
				xtype		: 'button',
				text		: '保存',
				id			: 'add',
				iconCls		: 'add',
				theme		: 'add',
				border		: false,
				handler		: function(){
					var item = condPanel.items.items
					var id;
					var text;
					var data = [];
					if(item.length==0){
						
					}else{
						for(var i=0;i<item.length;i=i+3){
							id = item[i].id.substring(0,item[i].id.indexOf('_drag_'));
							text = item[i].desc;
							data.push(id+"-"+text);
						}
					}
					showProgress('保存...');
					Ext.Ajax.request({
						url 	: globalConstant.contentPath + '/rptManuAction_doSaveRptInfo.action',
						params 	: {
							rptName : Ext.getCmp('rptName').getValue(),
							rptId   : RPTID,
							data	: Ext.encode(data)
						},
						method 	: 'POST',
						success : function(response) {
							Ext.MessageBox.hide();
							parent.Ext.Msg.alert("系统消息",response.responseText, function(){
								
							}, this);
						},
						scope 	: this
					});
				}
			},{
				xtype		: 'button',
				text		: '定制样式',
				id			: 'edit',
				iconCls		: 'edit',
				theme		: 'edit',
				borderStyle	: {
					borderRight	: 'none'
				},
				handler		: function(){
					
				}
			}]
		})
		var viewport = new Ext.Viewport({
			layout : 'border',
			items : [reportInfoGrid, northPanel,dimPanel]
		})
		viewport.doLayout();
	}
	function indexOfArray(array, dimId) {
		var index = -1;
		for( var i = 0; i < array.length; i++) {
			if(array[i].dimId == dimId)
				index = i;
		}
		return index;
	}
	function ddTreePanel(){
		var condDimArr = new Array();
		var condPanelTargetEl = condPanel.el.dom;
		var condPanelDropTarget = new Ext.dd.DropTarget(condPanelTargetEl, {
		ddGroup : 'dimDDGroup',
		copy : false,
		notifyDrop : function(ddSource, e, data) {
			var dragNode = ddSource.dragData.node;
			if(condPanel.items.items.length==0){
				condDimArr = [];
			}
			if(indexOfArray(condDimArr, dragNode.id) > -1) {
				parent.Ext.Msg.alert('系统消息', '该维度已使用');
				return;
			}
			Ext.Ajax.request({
				url : globalConstant.contentPath + '/compileReportAction_doGetParamsBaseInfo.action',
				params : {
					dropNodeId	: dragNode.id
				},
				method : 'POST',
				success : function(response) {
					var paramsObj = Ext.util.JSON.decode(response.responseText);
					for(var i=0;i<paramsObj.paramsInfo.data.length;i++){
						var level = paramsObj.paramsInfo.data[i].level;
						condPanel.add({
							xtype : 'label',
							id : dragNode.id + '_drag_label',
							name : dragNode.id + '_drag_label',
							text : dragNode.text + '：',
							desc : dragNode.text,
							style : 'padding-left:10px;padding-top:2px;'
						});
						if(level==1){
							if(paramsObj.paramsInfo.data[i].columnType=='STRING'){
								condPanel.add({
									xtype	: 'combo',
									id : dragNode.id + '_drag_field',
									name : dragNode.id + '_drag_field',
									width : 100,
									store : new Ext.data.JsonStore({
										url : globalConstant.contentPath + '/compileReportAction_dofindParamsValues.action',
										root : "data",
										totalProperty : "rowCount",
										remoteSort : true,
										fields : ['code', 'desc'],
										baseParams : {
											paramType	: dragNode.id,
											level		: level
										}
									}),
									displayField : 'desc',
									valueField : 'code',
									forceSelection : true,
									triggerAction : 'all',
									editable : false,
									listeners		: {
										select		: function(){
											search(this);
										}
									}
								});
							}
							if(paramsObj.paramsInfo.data[i].columnType=='DATE'){
								condPanel.add({
									xtype	: 'datefield',
									id 		: dragNode.id + '_drag_field',
									name 	: dragNode.id + '_drag_field',
									width 	: 100,
									format	: 'Ymd',
									editable	: true,
									listeners		: {
										select		: function(){
											search(this);
										}
									}
								});
							}
						}else{
							var dragTree = new Ext.tree.TreePanel({
								id : dragNode.id + '_drag_tree',
								height : 200,
								width : 250,
								rootVisible : false,
								lines : true,
								autoScroll : true,
								root : new Ext.tree.AsyncTreeNode({
									expanded : true,
									leaf : false,
									iconCls : 'folder'
								}),
								collapseFirst : false,
								listeners : {
									click : function(node) {// 树节点点击的时候触发的事件，选择完节点后菜单收缩隐藏
										Ext.getCmp(this.id.split('_drag_')[0] + '_drag_field').setNode(node);
										Ext.getCmp(this.id.split('_drag_')[0] + '_drag_menu').hide();
										search();
									}
								},
								loader : new Ext.tree.TreeLoader({
									dataUrl : globalConstant.contentPath + "/compileReportAction_dofindParamsValues.action",
									listeners	: {
										beforeload	: function(treeLoader, node) {
											this.baseParams.paramType = dragNode.id;
											this.baseParams.level = level;
										}
									}
								})
							});
							var dragMenu = new Ext.menu.Menu({
								id : dragNode.id + '_drag_menu',
								items : [dragTree],
								listeners : {
									hide : function(e) {
										if(Ext.getCmp(this.id.split('_drag_')[0] + '_drag_field'))
											Ext.getCmp(this.id.split('_drag_')[0] + '_drag_field').menu = null;
									}
								}
							});
							var dragField = new Ext.form.TriggerField({
								id : dragNode.id + '_drag_field',
								name : dragNode.id + '_drag_field',
								width : 120,
								editable : false,
								onSelect : function(record) {
									
								},
								onTriggerClick : function() {
									if(this.menu == null) {
										this.menu = Ext.getCmp(this.id.split('_drag_')[0] + '_drag_menu');
										this.menu.show(this.el, "tl-bl?");
									} else {
										this.menu.hide();
										this.menu = null;
									}
								},
								setNode : function(node) {
									this.node = node;
									this.setValue(node.text);
								},
								getNode : function() {
									return this.node;
								},
								listeners		: {
									select		: function(){
										alert();
										console.info(Ext.getCmp(dragNode.id + '_drag_field').getValue());
									}
								}
							});
							condPanel.add(dragField);
						}
						condPanel.add({
							xtype : 'button',
							id : dragNode.id + '_drag_button',
							name : dragNode.id + '_drag_button',
							iconCls : 'del',
							handler : function() {
								if(Ext.getCmp(this.id.split('_drag_')[0] + '_drag_menu'))
									Ext.getCmp(this.id.split('_drag_')[0] + '_drag_menu').removeAll();
								condPanel.remove(Ext.getCmp(this.id.split('_drag_')[0] + '_drag_label'));
								condPanel.remove(Ext.getCmp(this.id.split('_drag_')[0] + '_drag_field'));
								condPanel.remove(Ext.getCmp(this.id.split('_drag_')[0] + '_drag_button'));
								condPanel.doLayout();
								var index = -1;
								for( var i = 0; i < condDimArr.length; i++) {
									if(condDimArr[i].dimId == dragNode.id)
										index = i;
								}
								if(index > -1)
									condDimArr.splice(index, 1);
							}
						});
						condPanel.doLayout();
					}
				}
			})
			condDimArr.push({
				dimType : 'view',
				dimId : dragNode.id
			});
		}
	});
	}	 
	/***********************************************控件区域******************************************/
	var rptDimRoot = new Ext.tree.AsyncTreeNode({
		id 		: 'rptDimRoot',
		expanded : false,
		text	: '报表参数信息',
		leaf 	: false
	});

	//报表参数树
	var rptDimTree = new Ext.tree.TreePanel({
		id			: 'rptDimTree',
		width		: 160,
		border  	: true,
		rootVisible	: false,
		lines 		: false,
		border 		: false,
		autoScroll 	: true,
		root 		: rptDimRoot,
		collapseFirst : false,
		ddGroup 	: 'dimDDGroup',
		enableDrag 	: true,
		bodyStyle 	: 'background-color: #FFFFFF;',
		loader 	: new Ext.tree.TreeLoader({
			dataUrl : globalConstant.contentPath + "/rptManuAction_doGetRptDimTree.action",
			listeners	: {
				beforeload	: function(treeLoader, node){
					this.baseParams.rptId = RPTID
				}
			}
		}),
		listeners	: {
			click : function(node) {
				
			}
		}
	});
	var dimPanel = new Ext.Panel({
		width		: 150,
		titleStyle	: 'background:blue;color:white;padding:10px 5px;',
		collapsible : true,
		collapsed 	: true,
		title		: "报表维度",
		style 		: 'padding:5px 0 0 5px;background:#FFF;',
		bodyStyle	: 'background:#FFF;',
		region 		: 'west',
		layout		: 'column',
		items		: [rptDimTree]
	});
	
	var titlePanel = new Ext.Panel({
		style	: 'background:#FFF;',
		id 		: 'titlePanel',
		region	: 'north',
		bodyStyle: 'border:none;border-bottom:2px solid #E9E9E9;',
		height	: 60,
		layout: {
    		type	: 'hbox',
   			align	: 'middle',
   			pack	: 'center'				       
		},
		titleStyle	: 'background:blue;color:white;padding:10px 5px;',
		items		: [{
			xtype 		: 'textfield',
			name 		: 'rptName',
			id 			: 'rptName',
			style  		: 'background:none;border-color:#FFF;text-align:center;font-size:22px;font-family:黑体;',
			value       : '快速报表',
			selectOnFocus : true,
			height		: 50
		}]
	});
	var northPanel = new Ext.Panel({
		style	: 'padding:5px 5px 0 5px;background:#FFF;',
		id 		: 'northPanel',
		region	: 'north',
		layout  : 'border',
		border  : false,
		height	: 120,
		titleStyle	: 'background:blue;color:white;padding:10px 5px;',
		items		: [condPanel,titlePanel]
	});
	setTimeout(ddTreePanel,5000);
	generateGrid();
})