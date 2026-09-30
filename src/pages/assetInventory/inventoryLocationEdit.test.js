import { buildLocationDraft, LOCATION_IMPORT_HEADERS, parseLocationImport, validateLocation } from './inventoryLocationEdit';
const asset={tag:'001',city:'北京',building:'A',floor:'1层',quantity:1};
const options=()=>({city:['北京'],building:['A'],floor:['1层','2层']});
test('按标签匹配本项目资产，保留旧地点及新地点与备注',()=>{const rows=parseLocationImport([LOCATION_IMPORT_HEADERS,['001','北京','A','2层','迁移']], [asset],[],options);expect(rows[0].before.floor).toBe('1层');expect(rows[0].after.floor).toBe('2层');expect(rows[0].remark).toBe('迁移');});
test('拒绝跨项目、重复以及不匹配的地点，不返回部分结果',()=>{expect(()=>parseLocationImport([LOCATION_IMPORT_HEADERS,['002','北京','A','2层']], [asset],[],options)).toThrow('当前复盘项目范围');expect(()=>parseLocationImport([LOCATION_IMPORT_HEADERS,['001','北京','A','2层'],['001','北京','A','2层']], [asset],[],options)).toThrow('重复');expect(()=>validateLocation({city:'北京',building:'B',floor:'2层'},options)).toThrow('不匹配');expect(()=>validateLocation({city:'北京',building:'A',floor:''},options)).toThrow('均须填写');});
test('添加资产只复制台账字段，不推测地点',()=>{expect(buildLocationDraft({...asset,floor:''}).after.floor).toBe('');});
