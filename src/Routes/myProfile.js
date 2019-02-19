import React from "react";
import ProfileRejectionContainer from "../Containers/ProfileRejectionsContainer";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import axios from "axios";
import { CloudinaryContext } from "cloudinary-react";
import Modal from 'react-modal';
import { makeRejection } from "../Actions/UserActions";
import Fade from 'react-reveal/Fade';

class Profile extends React.Component {
  state = {
    display: false,
    user: "",
    ModalIsOpen:false,
    company:"",
    stage_of_rejection:"",
    rejection_url:"",
    errors:"",
    id:""
  };
  componentDidMount() {
    this.getProfile()
  }
  getProfile = () =>{
    let theUsername = this.props.history.location.pathname.split("/")[2];
    let token = localStorage.getItem("token");
    axios.get("http://localhost:3000/api/v1/profile", {
        headers: {
          Authorization: token
        },
        params: {
          username: theUsername
        }
      })
      .then(res => {
        this.setState({
          user: res.data.user,
          id:res.data.user.id
        });
            })
  }
  imageSubmit = () => {
    var myUploadWidget;
    myUploadWidget = window.cloudinary.openUploadWidget(
      {
        cloudName: "dz1dbcszc",
        uploadPreset: "igzkbflf"
      },
      (error, result) => {
        if (result.info.secure_url) {
        this.setState({
          rejection_url:result.info.secure_url,
          modalIsOpen:true
        })
        }
      }
    );
  };
  renderCloudinary = () => {
    return (
      <CloudinaryContext cloudName="dz1dbcszc" className="signupbuttons">
        <button
          className="rejectionButton"
          color="black"
          id="upload_widget_opener"
          onClick={() => this.imageSubmit()}
        >
          Upload a Rejection
        </button>
      </CloudinaryContext>
    );
  };
  changeHandler = (e) => {
    this.setState({
      [e.target.name]:e.target.value
    })
  }
  submitHandler = (e) => {
    e.preventDefault()
    if(this.state.company.length===0 || this.state.stage_of_rejection.length===0){
      this.setState({
        errors:"Fields cannot be left blank"
      })
    }
    else{
      let copy={...this.state}
      delete copy["errors"]
      delete copy["display"]
      delete copy["user"]
      delete copy["modalIsOpen"]
      this.props.createRejection(copy)
      this.getProfile()
      this.setState({
        modalIsOpen:false,
        company:"",
        stage_of_rejection:"",
        errors:""})
    }
  }
  renderProfile = () => {
    console.log(this.state.user.rejections)
    return (
      <React.Fragment>
        <Fade left duration={1000}>
        <div className="leftProfile">
        <img
          src={this.state.user.avatar}
          alt="avatar"
          className="avatarOnProfile"
        />
        <h1 className="profileH1">
          Name: {this.props.user.f_name} {this.props.user.l_name}
        </h1>
        <h1 className="profileH1">Username: {this.props.user.username}</h1>
        <h1 className="profileH1">Email: {this.props.user.email}</h1>
        <h1 className="profileH1">Cohort Name: {this.props.user.cohort_name}</h1>
        {this.renderCloudinary()}
      </div>
    </Fade>
        <Modal  className="rejectionModal" isOpen={this.state.modalIsOpen} style={{overlay:{ backgroundColor: 'rgba(0, 0, 0, 0.9)'
    }}}>

    <h1 className="ModalHeader">Rejection</h1>
          <form className="rejectionForm" onSubmit={(e)=>this.submitHandler(e)}>
            {this.state.errors ? <h1 className="ModalError">{this.state.errors}</h1> :null}
            <br/>
              <br/>

            <input className="ModalInput" type="text" placeholder="Company Name" name="company" onChange={(e)=>this.changeHandler(e)} value={this.state.company}/>
              <br/>
                <br/>

            <input className="ModalInput" type="text" placeholder="Stage of rejection" name="stage_of_rejection" onChange={(e)=>this.changeHandler(e)} value={this.state.stage_of_rejection}/>
              <br/>
                <br/>

            <button className="ModalButtons">Submit</button>
          </form>
          <br/>
            <br/>

          <button className="ModalButtons" onClick={()=>this.setState({modalIsOpen:false})}>Cancel</button>
            <h1>Preview</h1>
            <img src={this.state.rejection_url} alt="rejection" height="200vh" width="200vw"/>
        </Modal>
        <Fade right duration={1000}>

        <div className="rejectionsDiv">
          <h1 className="rejectionHeader">Rejections</h1>
          {this.state.user ? (
            <ProfileRejectionContainer
              rejections={this.props.user.rejections}

              reRender={this.getProfile}
            />
          ) : null}
        </div>
      </Fade>
      </React.Fragment>
    );
  };
  render() {
    return <div className="profileDiv">{this.state.user ? this.renderProfile() : null}</div>;
  }
}
const mapStateToProps = state => {
  return {
    user: state.user
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    createRejection : (rejectionObj) => {
      dispatch(makeRejection(rejectionObj))
    }
  }
}
export default withRouter(connect(mapStateToProps,mapDispatchToProps)(Profile));
