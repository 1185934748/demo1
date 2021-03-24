package com.pb.sas.dao.impl;

import java.sql.Clob;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import com.pb.sas.dao.inf.IRptManuDAO;
import com.pb.sas.util.db.JDBCMngr;
import com.pb.sas.util.json.JsonUtil;
import com.pb.sas.util.pojo.PageResult;

public class RptManuDAO extends BaseDAO implements IRptManuDAO{
	/**
	 * 查询初始化表格头信息
	 */
	public PageResult getRptHeaderInfo(Map paramMap) {
		String rptId = (String) paramMap.get("rptId");
		String sql = "select * from (" +
				"select a.rpt_id, a.debug_flag, a.column_no, a.alias_name ,b.indicator_full_id, b.date_attribute " +
				"from RPT_LIST_CALC a " + 
				"inner join RPT_LIST_CALC_DETAIL b " + 
				"on a.column_no = b.column_no and a.rpt_id=:rptId and b.rpt_id=:rptId " +
				"union " + 
				"select rpt_id, debug_flag, column_no, alias_name ,e.column_name, 'dim' " + 
				"from rpt_list_dimension e " +
				"where e.rpt_id =:rptId) c " +
				"order by c.column_no";
		List list = getSession().createSQLQuery(sql).setProperties(paramMap).list();
		PageResult pgr = new PageResult();
		pgr.setData(list);
		pgr.setRowCount(list.size());
		return pgr;
	}
	/**
	 * 查询表格数据信息
	 */
	public PageResult getRptInfo(Map paramMap) {
		String data = (String) paramMap.get("data");
		String rptTmptId = (String) paramMap.get("rptId");
		String userId = (String) paramMap.get("userId");
		String inDebugID = (String) paramMap.get("inDebugID");
		String dataDate = (String) paramMap.get("dataDate");
		String col = (String) paramMap.get("col");
		String colValue = (String) paramMap.get("colValue");
		String search = "";
		if(colValue!=null && !"".equals(colValue)){
			String value[] = colValue.split(",");
			String colsValue = "";
			for(int i=0;i<value.length;i++){
				colsValue += "'"+value[i]+"',"; 
			}
			colsValue = colsValue.substring(0,colsValue.length()-1);
			search+=" and a.COL"+ col +" in("+colsValue+")";
		}
		if(data!=null){
			Object[] obj = JsonUtil.getArrayFromJson(data);
			for(int i=0;i<obj.length;i++){
				String[] tmp = obj[i].toString().split("-");
				if(tmp.length==2){
					col = tmp[0];
					colValue = tmp[1];
					if(colValue!=null && !"".equals(colValue)){
						search+=" and a.COL"+ col +"='"+colValue+"'";
					}
				}
			}
		}
		String sql = "select report.fn_getRptListSQL( '"+userId+"', '"+rptTmptId+"', '"+inDebugID+"', '"+dataDate+"') test from dual";
        JDBCMngr jMngr =new  JDBCMngr();
        jMngr.conDB();
        PreparedStatement pst=jMngr.getPreparedStatement(sql);
        ResultSet rs=jMngr.execPreStmtQuery(pst);
        String sql1 = "";
    	try {
			while(rs.next()){
				Clob clob = (oracle.sql.CLOB)rs.getClob("test");
				if(clob != null){
			       sql1 = clob.getSubString((long)1,(int)clob.length());
			     }
			}
		} catch (SQLException e) {

		}finally{
			 jMngr.closeDB();
		}
		String sql2 = "select * from (" + sql1 + ") a where 1=1"+search;
		List list = getSession().createSQLQuery(sql2).list();
		PageResult pgr = new PageResult();
		pgr.setData(list);
		pgr.setRowCount(list.size());
		return pgr;
	}
	/**
	 * 查询页面左侧面板维度树信息
	 */
	public List getRptDimTree(Map paramMap) {
		String rptId = (String) paramMap.get("rptId");
		String sql = "select column_name,'100000','1',alias_name " +
				"from RPT_LIST_DIMENSION " +
				"where rpt_id=:rptId";
		List list = getSession().createSQLQuery(sql).setProperties(paramMap).list();
		return list;
	}
	/**
	 * 查询点击表头‘+’按钮树信息
	 */
	public List getTreeByStati(Map paramMap) {
		String level = (String) paramMap.get("level");
		String sql =  "SELECT  B.INDICATOR_FULL_ID, '100000','1', B.CN_NAME BCN_NAME," +
		 		"CASE WHEN B.CN_NAME IN (SELECT ALIAS_NAME FROM RPT_LIST_CALC WHERE RPT_ID='10029') " +
		 		"THEN '1' ELSE '' END " +
				"FROM INDICATOR_GTY_TYPE A " + 
				"LEFT JOIN INDICATOR_NAME B " + 
				"ON A.STATISTICAL_GRANULARITY_TYPE = " + 
				"B.STATISTICAL_GRANULARITY_TYPE and A.STATISTICAL_GRANULARITY_TYPE =:level " + 
				"LEFT JOIN (SELECT DISTINCT INDICATOR_FULL_ID, COUNT(RPT_ID) NUM " + 
				"FROM RPT_LIST_CALC_DETAIL " + 
				"where INDICATOR_FULL_ID in " + 
				"(select * " + 
				"from table(INDEX_AUTHORITY.fn_getFavIndexID('admin'))) " + 
				"GROUP BY INDICATOR_FULL_ID ) C " + 
				"ON B.INDICATOR_FULL_ID = C.INDICATOR_FULL_ID " + 
				"LEFT JOIN (SELECT DISTINCT STATISTICAL_GRANULARITY_TYPE, " + 
				"COUNT(INDICATOR_ID) LNUM " + 
				"FROM INDICATOR_NAME " + 
				"where  indicator_full_id in " + 
				"(select * " + 
				"from table(INDEX_AUTHORITY.fn_getFavIndexID('admin'))) " + 
				"GROUP BY STATISTICAL_GRANULARITY_TYPE) D " + 
				"ON A.STATISTICAL_GRANULARITY_TYPE = " + 
				"D.STATISTICAL_GRANULARITY_TYPE " + 
				"where b.indicator_full_id in " + 
				"(select * " + 
				"from table(INDEX_AUTHORITY.fn_getFavIndexID('admin'))) ";
		List list = getSession().createSQLQuery(sql).setProperties(paramMap).list();
		return list;
	}
	/**
	 * 表格头信息变化时先删除当前报表ID粒度
	 */
	public void delRpt(String rptId, int dimNum) {
		String sql = "delete from rpt_list_detail where rpt_id=:rptId and column_no>:dimNum";
		getSession().createSQLQuery(sql).setParameter("rptId", rptId).setParameter("dimNum", dimNum).executeUpdate();
		String sql1 = "delete from rpt_list_calc where rpt_id=:rptId";
		getSession().createSQLQuery(sql1).setParameter("rptId", rptId).executeUpdate();
		String sql2 = "delete from rpt_list_calc_detail where rpt_id=:rptId";
		getSession().createSQLQuery(sql2).setParameter("rptId", rptId).executeUpdate();
	}

}
