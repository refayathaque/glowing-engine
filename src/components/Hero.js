import image from "../images/jefferson-sees-tLZFUp_fRt8-unsplash.jpg";

const Hero = () => {
  return (
    <div className="border border-primary">
      <div className="container col-xxl-8 px-4 py-5">
        <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
          <div className="col-10 col-sm-8 col-lg-6">
            <img
              src={image}
              className="d-block mx-lg-auto img-fluid"
              alt="Bootstrap Themes"
              width="700"
              height="500"
              loading="lazy"
            />
          </div>
          <div className="col-lg-6">
            <h1 className="display-5 fw-bold lh-1 mb-3">
              Let's improve your business processes so you can spend more time
              doing what you enjoy
            </h1>
            <p className="lead" id="vision">
              Vision statement
            </p>
            <p className="lead" id="mission">
              Mission statement
            </p>
            <p className="lead" id="purpose">
              Purpose statement
            </p>
            <div className="d-grid gap-2 d-md-flex justify-content-md-start">
              <button
                type="button"
                className="btn btn-primary px-4"
              >
                Let's talk! 📞
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

// Based on 3rd example - https://getbootstrap.com/docs/5.0/examples/heroes/
// Image - https://unsplash.com/photos/tLZFUp_fRt8
