import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from '@material-ui/core/CircularProgress';
import {setCookie} from "../helpers/cookieHelpers";
import mainFormStyles from "./styles/MainForm.styles";

class MainForm extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      isChoosingFile: true,
      isUploadingFile : false,
    };
    
    this.inputFile = React.createRef();
    this.inputFileDefaultValue = "Нажмите чтобы выбрать файл";
    this.inputFileCustom = React.createRef();
    this.fileRegex = /(.*)\\(.*$)/;
  }
  
  handleCreatePlaylist = () => {

    fetch('api/playlist/create', {
      method: 'POST',
    })
      .then(response => {
        if (response.status !== 200) {
          console.error('App Error: status: ' + response.status);
          this.setState({isChoosingFile: false, isUploadingFile: false});
          return;
        }
        return response.json();
      })
      .then(playlist => {
        if (!playlist || !playlist.id)
          return;
        if(!playlist.channels)
          playlist.channels = [];
        setCookie("currentPlaylistId", playlist.id, {expires: 1000});
        this.props.onUpload(playlist);
      })
      .catch(error => console.error('Error:', error));
  };

  handleUploadPlaylist = event => {
    event.preventDefault();

    if (!this.inputFile.current || this.inputFile.current.files.length <= 0)
      return;

    this.setState({isChoosingFile: true, isUploadingFile : true}, () => {
      let formData = new FormData();
      formData.append('file', this.inputFile.current.files[0]);

      fetch('api/playlist/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (response.status !== 200) {
            console.error('App Error: status: ' + response.status);
            this.setState({isChoosingFile: false, isUploadingFile: false});
            return;
          }
          return response.json();
        })
        .then(playlist => {
          if (!playlist || !playlist.channels || !playlist.id)
            return;
          setCookie("currentPlaylistId", playlist.id, {expires: 1000});
          this.props.onUpload(playlist);
        })
        .catch(error => console.error('Error:', error));
    });
  };
  
  handleChooseFile = event => {
    if(!this.fileRegex.test(event.target.value)){
      this.inputFileCustom.current.value = this.inputFileDefaultValue;
      this.setState({isChoosingFile: true});
      return;
    } else if (event.target.value.length > 0) {
      this.inputFileCustom.current.value = event.target.value;
    }
    
    const matchResult = event.target.value.match(this.fileRegex);
    this.inputFileCustom.current.value = 'Файл: ' +  matchResult[2];
    this.setState({isChoosingFile: false});
  };
  
  render() {
    const {classes} = this.props;
    
    return (
      <div className={classes.welcome}>
        <Grid container direction='row' alignItems='flex-end'>
          <Grid item>
            <img alt='IPTV' className={classes.welcomeAppIcon} src={require("../icons/app-icon.svg")}/>
          </Grid>
          <Grid item>
            <Typography variant='h2' className={classes.title}>
              Редактор плейлистов
            </Typography>
          </Grid>
        </Grid>
        <form onSubmit={e => this.handleUploadPlaylist(e)}>
          <input onChange={this.handleChooseFile} 
                 className={classes.inputFile} type="file" ref={this.inputFile} accept=".m3u,.m3u8"/>
          <Grid container spacing={24}>
            <Grid item xs={9}>
              <FormControl fullWidth onClick={() => !this.state.isUploadingFile && this.inputFile.current.click()}>
                <InputBase inputRef={this.inputFileCustom}
                  readOnly
                  defaultValue={this.inputFileDefaultValue}
                  classes={{
                    input: classes.inputFileLabel,
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <Button disabled={this.state.isChoosingFile} type="submit" fullWidth
                      variant="contained" size="large" color='secondary'>
                Загрузить
                {this.state.isUploadingFile &&
                <CircularProgress size={30} className={classes.progress} color='secondary'/>}
              </Button>
            </Grid>
          </Grid>
          <p className={classes.title}>*Доступные типы файлов: m3u, m3u8</p>
          <Button variant="contained" size="medium" onClick={this.handleCreatePlaylist}>
            Или создать новый
          </Button>
        </form>
      </div>
    );
  }
}

MainForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(mainFormStyles)(MainForm);