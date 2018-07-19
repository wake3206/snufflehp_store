import React, { Component } from "react";
import { 
  Grid, 
  Segment ,
  Input,
  Label,
  Image,
  Checkbox,
  Icon,
  Header,
  Divider,
  Tab,
  Button
} from 'semantic-ui-react'
import { connect } from 'react-redux'
//import InputQty from "../../common/form/InputQty";
import { getByIds } from "../../../firebase/products";
import { addCart } from '../../../actions/CartAct';
import CartQty from './CartQty'
//CartQty
class Cart extends Component{

  constructor(props){
    super(props)
    this.state = {
      pLoading:true,
      listInf:[]
    }

    //console.log('const',props)
  }

  componentDidMount(){
    console.log('componentDidMount=>',this.props)
    const { Carts } = this.props;
    if(Carts !== undefined && Carts.length > 0){

      this.setPropsTolist(Carts)

    }
  }

  componentWillReceiveProps(propNew){

    console.log('componentWillReceiveProps=>',propNew)

    const { Carts } = propNew;
    if(Carts !== undefined && Carts.length > 0){

      this.setPropsTolist(Carts)

    }
  }

  setPropsTolist = (Carts) =>{

    this.setState({
      listInf:[]
    })
    let ids = Carts.map(item => item.prodId)
    //console.log('ids',ids)
    getByIds(ids).then((vals)=>{

      Carts.forEach(e => {
        console.log('foreach',vals[e.prodId])
        e.prodInf = vals[e.prodId]
        this.setState({
          listInf:[e]
        })

      });

      this.setState({pLoading:false})

    }).catch((error)=>{
      console.log('error',error)
    })
  }

  handleChangeQty = (prodId,qty) =>{
    console.log('handleChangeQty',prodId,qty)

    const model = {
      uid:this.props.userInf.id,
      carts:{
        prodId:prodId,
        qty:qty
      }
    }

    console.log('model',model)

    this.props.addCart(model).then((secc)=>{
      
     console.log('secc',secc)

    }).catch((error)=>{
      console.log('error->',error);
    })
  }

  render(){

    //let colSty = {}
    const secSty = {padding:'10px',margin:'5px',border:'1px solid rgba(139, 139, 140, 0.15)'}
    const sumSty = {padding:'2px',margin:'2px'}
    const sumLine = {marginTop:'10px'}
    const { userInf } = this.props
    const { listInf } = this.state

    //console.log('userInf',userInf);

    let address = userInf.address.addr 
          +' ตำบล'+userInf.address.sub_district
          +' อำเภอ'+userInf.address.district
          +' จังหวัด'+userInf.address.province
          +' '+userInf.address.postCode

    const panes = [
      { 
        menuItem: 'ไปรษณีย์ไทย', 
        render: () => <Tab.Pane>
          <Button  basic color='green'>
            <Icon name='check' />
            ส่งธรรมดา
          </Button>
          <Button  style={{boxShadow:'none'}} basic >
            ส่งลงทะเบียน
          </Button>
          <Button style={{boxShadow:'none'}}  basic >
            ส่ง EMS
          </Button>
        </Tab.Pane> 
      },
      { menuItem: 'Kerry express', render: () => <Tab.Pane>Kerry express</Tab.Pane> }
    ]

    let items = '';
    //console.log('Carts=>',Carts.length,Carts);

    //console.log('render listInf:',this.state.listInf)

    if(this.state.pLoading){

      items = (
        <Segment style={secSty}> 
          รอสักครู่...
        </Segment>
      )

    }else if(listInf !== undefined && listInf.length > 0){

      console.log('render listInf',listInf)
      items = listInf.map((item,index)=>{
        return (
          <Segment key={index} style={secSty}> 
            <Grid>
              <Grid.Row>
                <Grid.Column width={1} textAlign="left" >
                  <Checkbox />
                </Grid.Column>
                <Grid.Column width={9}   >
                  <Image 
                    src={'https://firebasestorage.googleapis.com/v0/b/snufflehp-v3.appspot.com/o/img_products%2Fm.jpg?alt=media&token=959d9bde-488b-40b7-a19a-c56ed2c244b0'} 
                    size='tiny' 
                    verticalAlign="top" 
                    floated="left"
                    />
                  <div style={{textAlign:'left',fontWeight:'bold'}}>{item.prodInf.name}</div>
                  <div style={{textAlign:'left'}}>{item.prodInf.desc}</div>
                </Grid.Column>
                <Grid.Column width={2} textAlign="left">
                  ฿{item.prodInf.price}
                </Grid.Column>
                <Grid.Column width={4} textAlign="right">
                  <CartQty prodId={item.prodId} qty={item.qty} onChangeQty={this.handleChangeQty} />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        )
      })
    }

    return <div>
      <Grid container padded="vertically"  >
        <Grid.Row  >
          <Grid.Column width={10} style={{paddingRight:"2px"}} >
            <Segment secondary style={Object.assign(secSty,{border:'1px solid rgba(172, 172, 173, 0.15)',boxShadow:'none'})}> 
              <Grid>
                <Grid.Row>
                  <Grid.Column width={1} textAlign="left" >
                    <Checkbox />
                  </Grid.Column>
                  <Grid.Column width={9} textAlign="left">
                    เลือกทั้งหมด
                  </Grid.Column>
                  <Grid.Column width={2} textAlign="left">
                    ราคา
                  </Grid.Column>
                  <Grid.Column width={4} textAlign="right">
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
                        <Label as="a" size="tiny" color="yellow" style={{float:'right'}} >เปลี่ยนที่อยู่</Label>
                      </Header.Content>
                    </Header>
                    {address}

                    <Header as='h5'  block color='grey' style={{marginTop:'40px'}} >
                      <Header.Content style={{width:'100%'}}>
                        ตัวเลือกในการจัดส่ง
                      </Header.Content>
                    </Header>
                    <Tab panes={panes} />

                    <Header as='h5'  block color='grey' style={{marginTop:'40px'}} >
                      <Header.Content style={{width:'100%'}}>
                        สรุปรายการสั่งซื้อ
                      </Header.Content>
                    </Header>
                    <Grid style={{marginLeft:'10px',marginRight:'10px'}}>
                      <Grid.Row style={sumSty}>
                        <Grid.Column width={8}>ราคาสินค้ารวม</Grid.Column>
                        <Grid.Column textAlign="right" width={6}>1,11222.00</Grid.Column>
                        <Grid.Column width={2}>บาท</Grid.Column>
                      </Grid.Row>
                      <Grid.Row style={sumSty}>
                        <Grid.Column width={8}>ค่าจัดส่ง</Grid.Column>
                        <Grid.Column textAlign="right"width={6}>120.00</Grid.Column>
                        <Grid.Column width={2}>บาท</Grid.Column>
                      </Grid.Row>
                      <Grid.Row style={sumSty} >
                        <Grid.Column style={sumLine}  width={8}>รวม</Grid.Column>
                        <Grid.Column style={Object.assign({},sumLine,{fontWeight:'bold',fontSize:'1.3rem',color:'orange'})} textAlign="right"width={6}>1,11222.00</Grid.Column>
                        <Grid.Column style={sumLine} width={2}>บาท</Grid.Column>
                      </Grid.Row>
                    </Grid>

                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={16}>
                    <Button fluid color="teal">ชำระเงิน</Button>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  }
}



const mapStateToProps = (state) => {
  return {
    userInf: state.User,
    Carts:state.Carts.lists
  }
}

export default connect(mapStateToProps,{addCart})(Cart);
