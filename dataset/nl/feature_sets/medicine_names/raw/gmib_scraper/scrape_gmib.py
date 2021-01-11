#!/usr/local/bin/python3
from selenium import webdriver
from bs4 import BeautifulSoup
from time import sleep


gmib_url_base = 'https://www.geneesmiddeleninformatiebank.nl/'
web_driver =    webdriver.Firefox(executable_path=YOUR_GECKO_DRIVER)

def clean_row_entry(columns):
    columns = [element.text.strip() for element in columns]
    return [element for element in columns if element]

web_driver.get(gmib_url_base)
web_driver.find_element_by_id('P1_SEARCH').click()
web_driver.find_element_by_xpath("//select[@name='P2_RESPPG']/option[text()='1000']").click()

initial_search =    True

x = 0

while 1:
    gmib_soup =                 BeautifulSoup(web_driver.page_source, 'html.parser')
    gmib_paging =               gmib_soup.find('ul', {'class':'paging'})
    
    gmib_current_page =         gmib_paging.find('strong')
    gmib_current_page_number =  gmib_current_page.text.strip()

    gmib_paging_pages =         [element for element in gmib_paging.find_all('li')]
    gmib_paging_pages_text =    [element.text.strip() for element in gmib_paging_pages]
    gmib_paging_current_index = gmib_paging_pages_text.index(gmib_current_page_number)
    is_last =                   gmib_paging_current_index == (len(gmib_paging_pages)-1)

    if not is_last:
        web_driver.get(gmib_url_base + 'ords/' + gmib_paging_pages[gmib_paging_current_index + 1].a.get('href'))

    gmib_results =              gmib_soup.find('table', {'summary':'Search Results'})

    if initial_search:
        header = clean_row_entry(gmib_results.find('thead').find('tr').find_all('th'))
        print(';'.join(header))
        initial_search = False

    rows =                      gmib_results.find_all('tbody')[-1].find_all('tr')

    data = [clean_row_entry(row) for row in rows]
    for row in data:
        print(';'.join(row))

    if is_last:
        break

    sleep(0.25)