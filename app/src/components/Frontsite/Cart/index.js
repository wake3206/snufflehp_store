import React, { Component } from "react";
import { 
  Grid, 
  Segment ,
  Label,
  Checkbox,
  Header,
  Button,
  Transition,
  Confirm
} from 'semantic-ui-react'
import { connect } from 'react-redux'
//import InputQty from "../../common/form/InputQty";
import { addCart,manageCart,deleteCartList,updateCartList } from '../../../actions/CartAct';
import CartsList from './CartsList'
import NumberFormat from 'react-number-format';
import Shiping from './Shiping'
import MuiDialog from "../../../components/common/dialog/MuiDialog";
import AddrShipping from "../../../components/common/form/AddrShipping";
import ModelError from '../../../components/common/Modal/ModalError'
//CartQty

class Cart extends Component{

  constructor(props){
    super(props)

    let address = (props.userInf.address !== undefined) ? props.userInf.address:{}
    this.state = {
      pLoading:true,
      listInf:[],
      totalProdPrice:0.00,
      transferPrice:0.00,
      sumPrice:{
        prodPrice:0.00,
        sumWeight:0,
        sumPlusPaking:0.00
      },
      address,
      addrForm: {
        isOpen: false
      },
      sumWeight:0,
      defaultWeight:450,
      plusPacking:{
        book:10,
        other:5
      },
      typeCommon:false,
      sumPlusPaking:0.00,
      initPriceShiping:{
        normal:20,
        regis:40,
        ems:60
      },
      priceShiping:{
        normal:0,
        regis:0,
        ems:0
      },
      selShiping:'',
      packingAdd:{
        dicutBox:false,
        bubble:false,
        dicutBoxPrice:16,
        bubblePrice:10
      },
      sumPackAdd:0.00,
      showComfirmPage:false,
      openDelConfirm:false,
      prepareDel:{},
      checkAll:false,
      mainLoading:false,
      errorOpen:false,
      msgError:''
      
    }

    //console.log('const',props)
  }

  componentWillReceiveProps(nextProps){
    const { Carts } = nextProps
    this.calculatePrice(Carts)

    
  }


  handleOpenProdDelete = (prodInf) =>{
    this.setState({
      openDelConfirm:true,
      prepareDel:prodInf
    })
  }

  handleDelProdCancel = () =>{
    this.setState({openDelConfirm:false})
  }

  handleDelProdConfirm = () =>{

    const { userInf,deleteCartList } = this.props
    const { prepareDel } = this.state

    deleteCartList(userInf.id,{prodId:prepareDel.prodId}).then((secc)=>{
      
      this.setState({
        openDelConfirm:false,
        prepareDel:{}
      })

    }).catch((error)=>{
      
      this.setState({errorOpen:true,msgError:error.message})
      console.log('error->',error);

    })

   

  }

  onCloseErrorModal = () =>{
    this.setState({errorOpen:false})
  }

  handleCheckAll = (e,data) => {
    
    console.log('handleCheckAll ',data)

    const { userInf,Carts,updateCartList } = this.props

    Carts.forEach((item)=>{

      let model = {
        prodId:item.prodId,
        checked:data.checked
      }
   
      updateCartList(userInf.id,model)

    })

  }

  showEditAddress = () => {
    //console.log('onCloseDialog')
    //this.props.setSignUpOpen(false)
    this.setState({
      addrForm: {
        isOpen: true
      }
    })
  }

  onSummitAddr = (data) =>{
    //console.log('onSummitAddr',data)
    this.setState({address:data})
    this.onCloseDialog()
  }

  onCloseDialog = () => {
    this.setState({
      addrForm: {
        isOpen: false
      }
    });
  }

  calculatePrice = (Carts) =>{
    //const { Carts } = this.props
    const { plusPacking,initPriceShiping,selShiping } = this.state
   
    //console.log('Carts',Carts)
    let prodPrice = 0.00
    let sumWeight = 0
    let sumPlusPaking = 0.00


    let modelPlusPack = {
      book:[],
      other:[]
    }

    if(Carts !== undefined){
      Carts.forEach((item)=>{
        if(item.prodInf !== undefined && item.checked){
          prodPrice += (item.qty * item.prodInf.price)
          sumWeight += (item.prodInf.weight !== undefined) ?  (item.qty * item.prodInf.weight):(item.qty * this.state.defaultWeight)
          
          if(item.prodInf.product_type !== undefined){
            modelPlusPack[item.prodInf.product_type].push(item.qty)
          }
        }
      })

      const sumBook = modelPlusPack.book.reduce( (acc, i) => acc + i,0)
      const sumOther = modelPlusPack.other.reduce( (acc, i) => acc + i,0)

      if(sumBook > 0){
        sumPlusPaking = ( (sumBook-1) * plusPacking.book) + ( sumOther * plusPacking.other)
      }else{
        sumPlusPaking = ( (sumOther - 1) * plusPacking.other)
      }

      //cal price shipping
      let calShip = {
        normal:initPriceShiping.normal + sumPlusPaking,
        regis:initPriceShiping.regis + sumPlusPaking,
        ems:initPriceShiping.ems + sumPlusPaking
      }
      //--
      let newSelShiping = selShiping

      if(newSelShiping !== 'ems'){

        newSelShiping = (sumWeight > 4000) ? 'normal':'regis'
        
      }

      this.setState({
        sumPrice:{ prodPrice,sumWeight,sumPlusPaking },
        priceShiping:calShip,
        selShiping:newSelShiping
      })

    }

    //console.log('prodPrice=>',prodPrice)
    //return { prodPrice,sumWeight,sumPlusPaking }
     
    
  }

  handleSelShipping = (data) => {

    this.setState({
      selShiping:data.selShiping,
      //transferPrice
    })


  }

  onToggleShipAdd = (e,data) =>{
 
    //console.log(data.name+'Price','addNow',addNow)
    let packingAdd = Object.assign({},this.state.packingAdd)

    packingAdd[data.name] = data.checked

    this.setState({
      packingAdd
    })


  }

  onShowConfirmPage = () =>{
    this.setState({showComfirmPage:true})
  }

  onShowPaymentPage = () =>{
    this.setState({showComfirmPage:false})
  }

  

  render(){

    
    //let colSty = {}
    const secSty = {padding:'10px',margin:'5px',border:'1px solid rgba(139, 139, 140, 0.15)'}
    const sumSty = {padding:'2px',margin:'2px'}
    const sumLine = {marginTop:'10px'}
    const { userInf,Carts } = this.props
    const { 
      address,
      addrForm,
      priceShiping,
      selShiping,
      showComfirmPage,
      openDelConfirm,
      errorOpen,
      msgError,
      sumPrice,
      packingAdd
    } = this.state
    //const addrInf = userInf.address;
    //console.log('===== render carts ======');
    //console.log('state',this.state,'prop',this.props);

    const sumPriceShip = (priceShiping[selShiping] === undefined) ? 0.00:parseFloat(priceShiping[selShiping]);

    let addressTxt = address.addr 
      +' ตำบล'+address.sub_district
      +' อำเภอ'+address.district
      +' จังหวัด'+address.province
      +' '+address.postCode

  
  
    let isCheckAll = true;

    let items = Carts.map((item,i)=>{

      if(!item.checked){
        isCheckAll = false
      }
      return <CartsList 
          key={item.prodId} 
          item={item} 
          handleOpenProdDelete={this.handleOpenProdDelete}
        />
    })

    //cal shiping addition
    const add1 = (packingAdd.dicutBox) ? parseFloat(packingAdd.dicutBoxPrice):0.00
    const add2 = (packingAdd.bubble) ? parseFloat(packingAdd.bubblePrice):0.00
    //

    //console.log('isCheckAll',isCheckAll)

    return <div>
      <ModelError isOpen={errorOpen} onClose={this.onCloseErrorModal} message={msgError} />
      <MuiDialog isOpen={addrForm.isOpen} onCloseDialog={this.onCloseDialog} clickBack={true} size="sm">
          <AddrShipping 
            inital={address} 
            
            onSummitAddr={this.onSummitAddr}
            onCloseDialog={this.onCloseDialog} 
            userInf={userInf} 
            headTitle="แก้ไขที่อยู่" 
          />
      </MuiDialog>
      <Confirm 
        open={openDelConfirm} 
        onCancel={this.handleDelProdCancel} 
        onConfirm={this.handleDelProdConfirm} 
        content='ต้องการลบรายการนี้หรือไม่'
      />
      
      <Transition visible={!showComfirmPage}  animation='fade' duration={500}>
   
          <Grid container padded="vertically"  >
            <Grid.Row  >
              <Grid.Column width={10} style={{paddingRight:"2px"}} >
                <Segment secondary style={Object.assign(secSty,{border:'1px solid rgba(172, 172, 173, 0.15)',boxShadow:'none'})}> 
                  <Grid>
                    <Grid.Row>
                      <Grid.Column width={1} textAlign="left" >
                        <Checkbox onChange={this.handleCheckAll} checked={isCheckAll} />
                      </Grid.Column>
                      <Grid.Column width={8} textAlign="left">
                        เลือกทั้งหมด
                      </Grid.Column>
                      <Grid.Column width={2} textAlign="left">
                        ราคา
                      </Grid.Column>
                      <Grid.Column width={5} textAlign="left">
                        จำนวน
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Segment>
                { items }
              
              </Grid.Column>
              <Grid.Column width={6} style={{paddingLeft:"2px"}}>
                <Segment style={secSty}> 
                  <Grid >
                    <Grid.Row >
                      <Grid.Column width={16} textAlign="left">

                        <Header as='h5'  block color='grey'>
                          <Header.Content style={{width:'100%'}}>
                            ที่อยู่ในการจัดส่ง
                            <Label onClick={this.showEditAddress} as="a" size="tiny" color="yellow" style={{float:'right'}} >เปลี่ยนที่อยู่</Label>
                          </Header.Content>
                        </Header>
                        { addressTxt }

                        <Header as='h5'  block color='grey' style={{marginTop:'40px'}} >
                          <Header.Content style={{width:'100%'}}>
                            ตัวเลือกในการจัดส่ง
                          </Header.Content>
                        </Header>

                        <Shiping 
                          weight={sumPrice.sumWeight} 
                          handleSelShipping={this.handleSelShipping} 
                          sumPlusPaking={sumPrice.sumPlusPaking}
                          priceShiping={priceShiping}
                          selShiping={selShiping}
                        />
                        
                        <Grid style={{marginLeft:'0px',marginRight:'10px',marginTop:'10px'}}>
                          <Grid.Row style={sumSty}>
                            <Grid.Column width={16}>
                              <Checkbox 
                                name="dicutBox"
                                
                                label={<label>เพิ่ม กล่องไดคัทขนาด ค. ของไปรษณีย์ 16 บาท</label>} 
                                onChange={this.onToggleShipAdd}
                              />
                            </Grid.Column>
                          </Grid.Row>
                          <Grid.Row style={sumSty}>
                            <Grid.Column width={16}>
                              <Checkbox 
                                name="bubble"
                                
                                label={<label>เพิ่ม บั๊บเบิ้ลกันกระแทก 10 บาท</label>} 
                                onChange={this.onToggleShipAdd}
                              />
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>

                        <Header as='h5'  block color='grey' style={{marginTop:'40px'}} >
                          <Header.Content style={{width:'100%'}}>
                            สรุปรายการสั่งซื้อ
                          </Header.Content>
                        </Header>

                        <Grid style={{marginLeft:'10px',marginRight:'10px'}}>
                          <Grid.Row style={sumSty}>
                            <Grid.Column width={8}>ราคาสินค้ารวม</Grid.Column>
                            <Grid.Column textAlign="right" width={6}>
                              <NumberFormat 
                                thousandSeparator={true} 
                                value={parseFloat(sumPrice.prodPrice)} 
                                displayType='text'
                                decimalScale={2}
                              />
                            </Grid.Column>
                            <Grid.Column width={2}>บาท</Grid.Column>
                          </Grid.Row>
                          <Grid.Row style={sumSty}>
                            <Grid.Column width={8}>ค่าจัดส่ง</Grid.Column>
                            <Grid.Column textAlign="right"width={6}>
                              <NumberFormat 
                                  thousandSeparator={true} 
                                  value={
                                    sumPriceShip
                                    + add1
                                    + add2
                                  } 
                                  displayType='text'
                                />
                            </Grid.Column>
                            <Grid.Column width={2}>บาท</Grid.Column>
                          </Grid.Row>
                          <Grid.Row style={sumSty} >
                            <Grid.Column style={sumLine}  width={8}>รวม</Grid.Column>
                            <Grid.Column 
                              style={Object.assign({},sumLine,{fontWeight:'bold',fontSize:'1.3rem',color:'orange'})} 
                              textAlign="right"width={6}>
                  
                              <NumberFormat 
                                  thousandSeparator={true} 
                                  value={parseFloat(sumPrice.prodPrice) 
                                          + parseFloat(sumPriceShip)
                                          + add1
                                          + add2
                                        } 
                                  displayType='text'
                                />
                            </Grid.Column>
                            <Grid.Column style={sumLine} width={2}>บาท</Grid.Column>
                          </Grid.Row>
                        </Grid>

                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={16}>
                        <Button fluid color="teal" onClick={this.onShowConfirmPage} >ชำระเงิน</Button>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
      
      </Transition>
      <Transition visible={showComfirmPage}  animation='fade' duration={500}>
        
          <div style={{paddingTop:'60px'}}>
          <Segment style={Object.assign({},secSty,{
            width:'600px',
            marginLeft:'auto',
            marginRight:'auto'
            })}> 
            <Grid >
              <Grid.Row >
                <Grid.Column width={16} textAlign="left">

                  <Header as='h5'  block color='grey'>
                    <Header.Content style={{width:'100%'}}>
                      ที่อยู่ในการจัดส่ง
                    </Header.Content>
                  </Header>
                  { addressTxt }

                  <Header as='h5'  block color='grey' style={{marginTop:'40px'}} >
                    <Header.Content style={{width:'100%'}}>
                      สรุปรายการสั่งซื้อ
                    </Header.Content>
                  </Header>

                  <Grid style={{marginLeft:'10px',marginRight:'10px'}}>
                    <Grid.Row style={sumSty}>
                      <Grid.Column width={8}>ราคาสินค้ารวม</Grid.Column>
                      <Grid.Column textAlign="right" width={6}>
                        <NumberFormat 
                          thousandSeparator={true} 
                          value={parseFloat(sumPrice.prodPrice)} 
                          displayType='text'
                          decimalScale={2}
                        />
                      </Grid.Column>
                      <Grid.Column width={2}>บาท</Grid.Column>
                    </Grid.Row>
                    <Grid.Row style={sumSty}>
                      <Grid.Column width={8}>ค่าจัดส่ง</Grid.Column>
                      <Grid.Column textAlign="right"width={6}>
                        <NumberFormat 
                            thousandSeparator={true} 
                            value={
                              sumPriceShip
                              + add1
                              + add2
                            } 
                            displayType='text'
                          />
                      </Grid.Column>
                      <Grid.Column width={2}>บาท</Grid.Column>
                    </Grid.Row>
                    <Grid.Row style={sumSty} >
                      <Grid.Column style={sumLine}  width={8}>รวม</Grid.Column>
                      <Grid.Column 
                        style={Object.assign({},sumLine,{fontWeight:'bold',fontSize:'1.3rem',color:'orange'})} 
                        textAlign="right"width={6}>
            
                        <NumberFormat 
                            thousandSeparator={true} 
                            value={parseFloat(sumPrice.prodPrice) 
                              + sumPriceShip
                              + add1
                              + add2
                            } 
                            displayType='text'
                          />
                      </Grid.Column>
                      <Grid.Column style={sumLine} width={2}>บาท</Grid.Column>
                    </Grid.Row>
                  </Grid>

                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={16}>
                  <Button fluid color="teal"  >ยืนยันการชำระเงิน</Button>
                  <Button fluid style={{marginTop:'5px'}} onClick={this.onShowPaymentPage} content='กลับหน้าชำระเงิน' basic />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
          </div>
        
      </Transition>
    
    
      
  
       
      
     

    </div>
  }
}



const mapStateToProps = (state) => {
  return {
    userInf: state.User,
    Carts:state.Carts.lists
  }
}

export default connect(mapStateToProps,{ 
  addCart,
  manageCart,
  deleteCartList ,
  updateCartList
})(Cart);
