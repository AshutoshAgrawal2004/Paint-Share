var firebaseConfig = {
  apiKey: "AIzaSyAB92iqBK9umMSEr8CY5xAO0iTAB-qxDG0",
  authDomain: "p5-drawing-sharing.firebaseapp.com",
  databaseURL: "https://p5-drawing-sharing.firebaseio.com",
  projectId: "p5-drawing-sharing",
  storageBucket: "",
  messagingSenderId: "761615607627",
  appId: "1:761615607627:web:295790d72cb2dff3"
};
var db, imgcollection, imgurl;
var imgcontainer, snackbar, filterlist, filterbasis, savebtn, savetofbbtn;

function init() {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  imgcollection = db.collection('Images');
  snackbar = $('#snackbar')[0];
  makesnack('Firebase is Ready');
  imgcontainer = $('.imgcontainer')[0];
  filterlist = $('#filterlist');
  filterbasis = filterlist.val();
  filterlist.change(() => {
    filterbasis = filterlist.val();
    makesnack('loading...');
    showImages();
  })
  savebtn = $('#saveart');
  savebtn.click(() => {
    imgurl = canvas.toDataURL();
    $('.fbconsole').css('display', 'block');
    $('.sketch').css('display', 'none');
    $('.imgcontainer').css('display', 'none');
  })
  savetofbbtn = $('#savetofb');
  savetofbbtn.click(() => {
    $('.fbconsole').css('display', 'none');
    $('.sketch').css('display', 'block');
    $('.imgcontainer').css('display', 'block');
  });
  showImages();
}

function saveImage() {
  var title = $('#title').val();
  var creator = $('#creator').val();
  var imgdata = {
    title: title,
    creator: creator,
    imgurl: imgurl,
    likes: 0
  }
  imgcollection.add(imgdata).then(docRef => {
    imgcollection.doc(docRef.id).update({
      docid: docRef.id,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      makesnack('Saved');
      showImages();
    });
  }).catch(error => makesnack(error));
}

function showImages() {
  makesnack('loading...');
  imgcollection.orderBy(filterbasis, 'desc').get().then((querySnapshot) => {
    while(imgcontainer.firstChild) imgcontainer.removeChild(imgcontainer.firstChild);
    querySnapshot.forEach((doc) => {
      // console.log(`${doc.id} => ${doc.data()}`);
      let json = doc.data();
      let imghtml = `
      <div class="oneimage">
       <div class="imgtitle">${json.title}</div>
        <img src="${json.imgurl}" alt="Failed to load" class="loadedimg">
        <div class="painter">${json.creator}</div>
        <button class="likebtn far fa-thumbs-up" id="${json.docid}"></button>
         <span id="nooflikes">${json.likes}</span>
         
      </div>
      `
      imgcontainer.innerHTML += imghtml;
    })
    makesnack('Loaded!');
  }).then(() => {
    let likebtns = $('.likebtn');
    likebtns.one('click', e => {
      console.log('liked')
      var newnooflikes = Number(e.target.nextElementSibling.textContent) + 1;
      var docrefid = e.target.id;
      e.target.className = 'likebtn fas fa-thumbs-up'
      imgcollection.doc(docrefid).update({
        likes: firebase.firestore.FieldValue.increment(1)
      }).then(() => {
        makesnack('liked');
        e.target.nextElementSibling.textContent = newnooflikes;
      })
    });
   
    makesnack('Ready!')
  }).catch(e => {
    makesnack('failed retrying now.....');
    showImages();
  });
}

function makesnack(msg) {
  snackbar.innerHTML = msg;
  snackbar.className = 'show';
  setTimeout(function() {
    snackbar.className = snackbar.className.replace('show', '');
  }, 3000);
}
