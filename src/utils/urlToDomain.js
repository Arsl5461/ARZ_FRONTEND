exports.convertUrlToDomainFormat = (url) => {
    try {
      const parsedUrl = new URL(url);
      let domain = parsedUrl.hostname;
  
      if (domain.startsWith('www.')) {
        domain = domain.slice(4);
      }
  
      return domain;
    } catch (error) {
      return null;
    }
  };
  exports.urlToDomainFormat = (url) => {
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;
      return domain;
    } catch (error) {
      return null;
    }
  };