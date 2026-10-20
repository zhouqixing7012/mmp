import React from 'react';
import {fireEvent,render,screen} from '@testing-library/react';
import {PhotoPreviewModal} from './AssetInventoryImageReviewV2';

jest.mock('antd',()=>{
  const Button=({children,onClick,icon,disabled})=><button onClick={onClick} disabled={disabled}>{icon}{children}</button>;
  return {Button,Tooltip:({children})=>children,Modal:({open,children})=>open?<div>{children}</div>:null,Typography:{Text:({children})=><span>{children}</span>}};
});

test('图片支持按90度旋转并可重置',()=>{
  render(<PhotoPreviewModal open photos={[{key:'overall',label:'本次照片',src:'data:image/png;base64,cA=='}]} index={0} onIndexChange={()=>{}} onClose={()=>{}}/>);
  const mainImage=screen.getAllByAltText('本次照片')[0];
  fireEvent.click(screen.getByRole('button',{name:'向右旋转'}));expect(mainImage.style.transform).toContain('rotate(90deg)');
  fireEvent.click(screen.getByRole('button',{name:'向左旋转'}));expect(mainImage.style.transform).toContain('rotate(0deg)');
  fireEvent.click(screen.getByRole('button',{name:'向左旋转'}));expect(mainImage.style.transform).toContain('rotate(-90deg)');
  fireEvent.click(screen.getByRole('button',{name:'重置'}));expect(mainImage.style.transform).toContain('rotate(0deg)');
});
