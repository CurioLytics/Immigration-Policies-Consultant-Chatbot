import React, { useState } from 'react'; // Removed useEffect, useRef
import { Link } from 'react-router-dom';
import TopBar from '../components/layout/TopBar'; // Import the new TopBar
import './LandingPage.css';

// Import SVGs
import image1Traced from '../assets/landing_page_icons/image_1_traced.svg';
import image3Traced from '../assets/landing_page_icons/image_3_traced.svg';
import vector1 from '../assets/landing_page_icons/vector_1.svg';
import vector3 from '../assets/landing_page_icons/vector_3.svg';
import vector from '../assets/landing_page_icons/vector.svg';
import flyingAirplaneTraced from '../assets/landing_page_icons/flying_airplane_traced.svg';
import image4TracedChatbot from '../assets/landing_page_icons/image_4_traced_chatbot.svg';
import image2TracedChecklist from '../assets/landing_page_icons/image_2_traced_checklist.svg';
import arrowDropDown from '../assets/landing_page_icons/arrow_drop_down.svg';
import arrowRight from '../assets/landing_page_icons/arrow_right.svg';


const AccordionItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="accordion-item">
            <div className="accordion-header" onClick={toggleAccordion}>
                <span>{question}</span>
                <img 
                    src={arrowDropDown} 
                    alt="arrow icon" 
                    className={`accordion-arrow ${isOpen ? 'open' : ''}`} 
                />
            </div>
            {isOpen && (
                <div className="accordion-content">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

const LandingPage = () => {
    // Removed showTopBar, lastScrollY state and handleScroll effect

    return (
        <div className="landing-page">
            <TopBar isLoggedIn={false} /> {/* Use the new TopBar component */}

            <header className="hero-section">
                <div className="hero-background-elements"> {/* Re-added the opening div */}
                    <img src={image1Traced} alt="" className="bg-img-1" />
                    <img src={image3Traced} alt="" className="bg-img-2" />
                    <img src={vector1} alt="" className="bg-vector-1" />
                    <img src={vector3} alt="" className="bg-vector-2" />
                    <img src={vector} alt="" className="bg-vector-main" />
                </div>
                <div className="hero-content">
                    <div className="logo-large">
                        <span className="logo-visamade">visamade</span>
                        <span className="logo-easy">easy</span>
                    </div>
                    <h1>Trợ thủ AI cho hồ sơ du học của bạn</h1>
                </div>
            </header>

            <section id="features" className="features-section">
                <div className="feature-tab">
                    <img src={flyingAirplaneTraced} alt="Airplane icon" />
                    <p>Theo dõi từng bước chuẩn bị hồ sơ của bạn. Đánh dấu tiến độ và nhận nhắc nhở quan trọng để không bỏ lỡ deadline.</p>
                </div>
                <div className="feature-tab">
                    <img src={image4TracedChatbot} alt="Chatbot icon" />
                    <p>Trợ lý AI sẵn sàng giải đáp thắc mắc visa của bạn. Nhận phản hồi nhanh chóng, chính xác và được cập nhật liên tục.</p>
                </div>
                <div className="feature-tab">
                    <img src={image2TracedChecklist} alt="Checklist icon" />
                    <p>Danh sách giấy tờ đầy đủ cho từng loại visa. Đánh dấu tài liệu bạn đã có và xuất PDF chỉ trong một cú nhấp.</p>
                </div>
            </section>

            <section id="about" className="about-section">
                <h2>Về chúng tôi</h2>
                <p>
                    Lorem ipsum dolor sit amet consectetur. Vulputate eu sociis blandit lacus quis maecenas venenatis. Integer molestie ut morbi enim arcu est dolor aenean. Sed facilisis venenatis proin elementum. Ultrices lacus cursus convallis vivamus. Hendrerit non varius maecenas fermentum elit nascetur dictumst eget amet. Vivamus id suspendisse sagittis non feugiat. Lectus consectetur est et turpis nulla. Pharetra amet donec ultrices ac aliquet nunc magna viverra in. Volutpat tristique feugiat iaculis lacus diam adipiscing dolor nulla vestibulum. Volutpat sed pharetra ipsum malesuada nunc faucibus amet at felis. Cursus dui massa augue venenatis est cursus id sit arcu. Fringilla scelerisque at cras enim at dui. Aliquet mattis tristique imperdiet consectetur sit molestie donec massa.
                    <br /><br />
                    Lacinia purus tellus mauris ipsum et facilisi sed ultrices. Viverra feugiat dolor nunc mi sed elementum feugiat quisque. Venenatis cursus nunc mi a scelerisque nisi. Turpis ridiculus id velit potenti congue. Ornare at proin in volutpat magna. In hendrerit mi vitae at. Pharetra laoreet ullamcorper facilisis cursus sodales proin.
                    <br /><br />
                    Aenean sagittis auctor sit ultrices porta. Duis volutpat dapibus quis dui massa magna nisi risus. Ultricies molestie tincidunt sociis nunc turpis sagittis. Tristique a metus feugiat mi molestie nibh fermentum donec pellentesque. At porttitor etiam arcu sagittis penatibus sagittis enim neque enim. Faucibus scelerisque magna sit auctor. Nunc ac aliquam ac cursus molestie aliquet gravida habitasse.
                </p>
            </section>

            <section id="faq" className="faq-section">
                <h2>Câu hỏi thường gặp (FAQs)</h2>
                <div className="faq-accordion">
                    <AccordionItem 
                        question="Question 1: What is VisaMadeEasy?" 
                        answer="VisaMadeEasy is an AI-powered assistant designed to help you navigate the complexities of student visa applications. We provide guidance, document checklists, and AI chat support." 
                    />
                    <AccordionItem 
                        question="Question 2: How does the AI assistant work?" 
                        answer="Our AI assistant is trained on a vast database of immigration policies and procedures. It can answer your questions, help you identify required documents, and provide general advice. However, it is not a substitute for professional legal advice." 
                    />
                    <AccordionItem 
                        question="Question 3: Can I track my application progress?" 
                        answer="While VisaMadeEasy helps you prepare your application, it does not directly integrate with official government portals for tracking. We help you manage your preparation steps and deadlines." 
                    />
                    <AccordionItem 
                        question="Question 4: Is my data secure?" 
                        answer="We take data security seriously. All personal information is encrypted and stored securely. Please refer to our Privacy Policy for more details." 
                    />
                </div>
            </section>

            {/* Footer can be added here if present in Figma or desired */}
            {/* <footer className="footer-section"> ... </footer> */}
        </div>
    );
};

export default LandingPage;
