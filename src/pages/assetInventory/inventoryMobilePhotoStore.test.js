import { installInventoryPhotoIndexedDb } from '../../testUtils/inventoryPhotoIndexedDb';
import { getCapturedInventoryPhoto, saveCapturedInventoryPhoto } from './inventoryMobilePhotoStore';

test('拍照Blob只存一份，业务结果只获得照片标识',async()=>{
  const {records}=installInventoryPhotoIndexedDb();
  const file=new File(['actual-picture'],'actual.png',{type:'image/png'});
  const metadata=await saveCapturedInventoryPhoto(file,'资产整体照片');
  expect(metadata).toEqual({photoId:1,fileName:'actual.png',label:'资产整体照片'});
  expect(records.size).toBe(1);expect(await getCapturedInventoryPhoto(metadata.photoId)).toBe(file);
  expect(window.localStorage.length).toBe(0);
});

test('照片存储失败时抛出明确失败，不退回base64或localStorage',async()=>{
  const {failWrites,records}=installInventoryPhotoIndexedDb();failWrites();
  await expect(saveCapturedInventoryPhoto(new File(['photo'],'photo.png',{type:'image/png'}),'资产整体照片')).rejects.toThrow('照片保存失败');
  expect(records.size).toBe(0);expect(window.localStorage.length).toBe(0);
});

test('浏览器无IndexedDB时明确拒绝保存',async()=>{
  Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});
  await expect(saveCapturedInventoryPhoto(new File(['photo'],'photo.png'),'照片')).rejects.toThrow('当前浏览器不支持照片存储');
});
